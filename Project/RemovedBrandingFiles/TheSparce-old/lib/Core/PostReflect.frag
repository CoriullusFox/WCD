Pixel

fragment PostReflect

inputs
{
	texture Color0;
	texture Color1;
	texture Geometry;
	textureCube Environment;
	float2 Uv;
	float2 ScreenDim;
	float NearClip;
	float FarClip;
	float FieldOfView;
	float2 NearPlaneSizeView;
	
	float3 WorldFrustumNearPosition;
	float3 WorldFrustumVector;
	float4x4 View;
	float4x4 Projection;
	float4x4 InverseProjection;
	float4x4 ViewInverse;
}

outputs
{
	float4 Color;
}

fragmentCode

float2 ToUv(float2 ndcPos)
{
    return ndcPos * 0.5 + float2(0.5);
}

float3 GetViewPositionFromUv(float2 uv, inout Data data)
{
    // Pull data from the geo buffer
    float4 geoSample = tex2D(Geometry, uv);
    float3 viewNormal = geoSample.xyz * 2.0 - float3(1);
    float normalizedEyeToFarDepth = geoSample.a;
    float eyeToFarDepth = normalizedEyeToFarDepth * data.FarClip;
        
    float2 nearPlaneDimensions = NearPlaneSizeView;
    
    float3 nearPlaneBottomLeft = float3(nearPlaneDimensions * -0.5, -data.NearClip);
    
    float3 nearPlanePosition = nearPlaneBottomLeft + float3(nearPlaneDimensions * uv, 0);
    
    // The near plane position is itself basically a vector (because the camera is at 0, 0, 0)
    // We need to intersect the near plane vector with a z-facing plane generated
    // from the sampled depth in order to get the actual view position
    // This is a simplification of the plane-ray intersection
    float3 viewPosition = (eyeToFarDepth / data.NearClip) * nearPlanePosition;
    return viewPosition;
}

float2 BinarySearch(float3 rayPosNdc, float3 rayDirNdc, inout Data data)
{
    // Start the check half way through the ray
    rayDirNdc *= 0.5;
    float3 currPosNdc = rayPosNdc + rayDirNdc;
 
    for(int i = 0; i < 5; i++)
    {
        // Sample the depth of the current Pixel
        float2 rayUv = ToUv(currPosNdc.xy);
        float3 samplePosView = GetViewPositionFromUv(rayUv, data);
        
        // Bring it into ndc
        float4 samplePosNdc = mul(Projection, float4(samplePosView, 1));
        samplePosNdc.xyz /= samplePosNdc.w;
        
        // If we didn't hit it yet, search forward
        if(samplePosNdc.z > currPosNdc.z)
            currPosNdc += rayDirNdc;
 
        rayDirNdc *= 0.5;
        currPosNdc -= rayDirNdc;    
    }

    return currPosNdc.xy;
}

bool RayMarch(float3 rayPosNdc, float3 rayDirNdc, out float2 hitCoordsNdc, inout Data data)
{
    // Store the last position of the ray to compare the starting point of the ray with
    // the currently sampled depth
    float3 lastPosNdc = rayPosNdc;
    rayPosNdc += rayDirNdc;
    
    for(int i = 0; i < 40; i++)
    {
        // If the ray position goes outside the screen
        if(rayPosNdc.x < -1 || rayPosNdc.x > 1 ||
           rayPosNdc.y < -1 || rayPosNdc.y > 1)
        {
           return false;
        }
        
        // Sample the depth of the current Pixel
        float2 rayUv = ToUv(rayPosNdc.xy);
        float3 samplePosView = GetViewPositionFromUv(rayUv, data);
        
        // Bring it into ndc
        float4 samplePosNdc = mul(Projection, float4(samplePosView, 1));
        samplePosNdc.xyz /= samplePosNdc.w;
        
        // If the sampled position is 'more in front' than our view ray position
        if(samplePosNdc.z < rayPosNdc.z)
        {
            // If we've hit the far plane, return that we haven't hit anything
            // This check can be removed and 
            if(samplePosNdc.z > 0.9999)
                return false;
                
            // Ignore if the geometry is in front of where this ray segment startPosNdc
            // (an object is closer to the camera)
            if(samplePosNdc.z >= lastPosNdc.z - 0.001)
            {
                hitCoordsNdc = BinarySearch(lastPosNdc, rayDirNdc, data);
                return true;
            }
        }
        
        // Step forward
        lastPosNdc = rayPosNdc;
        rayPosNdc += rayDirNdc;
    }
    
    return false;
}

void PostReflect(inout Data data)
{
    // Default to black
    data.Color = float4(0,0,0,0);
    
    // Red channel is the strength of reflection
    // Green channel is the environment scalar
    float4 reflectMapSample = tex2D(Color1, data.Uv);
    float reflectFinalScalar = reflectMapSample.r;
    float reflectScalar = reflectMapSample.g;
    float reflectEnvironmentScalar = reflectMapSample.b;
    
    // Early out if there's no reflection being applied
    if(reflectFinalScalar == 0.0)
        return;
    
    // Grab the view position of the current position (reconstruct from the geo buffer)
    float3 viewPosition = GetViewPositionFromUv(data.Uv, data);
    
    float4 geoSample = tex2D(Geometry, data.Uv);
    float3 viewNormal = geoSample.xyz * 2.0 - float3(1);
    
    // The direction we're going to walk in view space
    float3 rayDirView = normalize(reflect(normalize(viewPosition), normalize(viewNormal)));
    
    // We should multiply the ray direction by the near plane because
    // the position B could end up being behind the camera, and projection would mess it up (flip it)
    float3 posAView = viewPosition;
    float3 posBView = viewPosition + rayDirView * 0.1;
    
    float4 posANdc = mul(data.Projection, float4(posAView, 1));
    posANdc.xyz /= posANdc.w;
    
    float4 posBNdc = mul(data.Projection, float4(posBView, 1));
    posBNdc.xyz /= posBNdc.w;
    
    // When visualizing the ray direction after the subtraction and normalize
    // the z will be VERY SMALL because the z is non-linear (it goes 0 to 1, but it be like 0, 0.9, 0.99, 0.999)
    float3 rayDirNdc = posBNdc.xyz - posANdc.xyz;
    rayDirNdc /= (length(rayDirNdc.xy) + 0.01);
    
    // The scalar affects how far we walk in ndc and can be tunable
    // The higher the number, the less steps we will take and the faster the algorithm will be
    rayDirNdc = rayDirNdc * 0.05;
    
    // We don't walk in pixels because as the resolution got higher, we wouldn't walk as far with each step
    
    // Ray march for the reflected color
    float2 hitCoordsNdc;
    bool rayHit = RayMarch(posANdc.xyz, rayDirNdc, hitCoordsNdc, data);
    
    // Sample the environment cube map
    float3 rayDirWorld = mul(ViewInverse, float4(rayDirView, 0)).xyz;
    float3 environmentColor = texCUBE(Environment, rayDirWorld).rgb;
    environmentColor *= reflectEnvironmentScalar;
    
    float3 finalReflectColor = environmentColor;
    
    // Interpolate between the scene color and the reflected color for our final color
    float3 sceneColor = tex2D(Color0, data.Uv).rgb;
    
    // If the ray hit geometry, we want to sample for the color at its position
    if(rayHit)
    {
        // Fade out nearing the edge of the screen
        float2 dCoords = abs(hitCoordsNdc.xy * 0.6);
        float screenEdgeFactor = clamp(1.0 - (dCoords.x + dCoords.y), 0, 1);  
        
        // Sample the final reflected color
        float2 hitCoordsUv = ToUv(hitCoordsNdc);
        float3 reflectColor = tex2D(Color0, hitCoordsUv).rgb;
        
        reflectColor = lerp(sceneColor, reflectColor, screenEdgeFactor);
        finalReflectColor = lerp(environmentColor, reflectColor, reflectScalar);
    }
    
    finalReflectColor = lerp(sceneColor, finalReflectColor, reflectFinalScalar);
    
    // This will be added back to the scene after being blurred
    float3 diff = finalReflectColor - sceneColor;
    data.Color = float4(diff, 1);
}

fragment ApplyPostReflection

inputs
{
    // Scene
	texture Color0;
	// Reflections
	texture Color1;
	float2 Uv;
}

outputs
{
	float4 Color;
}

fragmentCode

void ApplyPostReflection(inout Data data)
{
    data.Color = tex2D(Color0, data.Uv) + tex2D(Color1, data.Uv);
}