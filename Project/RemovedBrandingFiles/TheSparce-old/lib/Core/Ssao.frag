Pixel

fragment Ssao

inputs
{
  float2 Uv;
  float NearClip;
  float FarClip;
  float2 ScreenDim;
  float2 NearPlaneSizeView;
  float4x4 Projection;

  float Radius;
  float Intensity;

  texture Color0;
  texture Color1;
}

outputs
{
  float4 Color;
}

fragmentCode

vec3 Kernal[32] = vec3[32]
(
  vec3(-0.0616282, 0.0501193, 0.0621818),
  vec3(-0.0266748, -0.0659515, 0.0751954),
  vec3(-0.0941047, -0.0515226, 0.0115902),
  vec3(-0.0606945, 0.0619802, 0.0740601),
  vec3(0.0330368, 0.106761, 0.0488668),
  vec3(0.0885578, 0.0922208, 0.0313381),
  vec3(0.0441425, 0.070135, 0.116621),
  vec3(0.134195, 0.0161297, 0.0783936),
  vec3(0.0487178, -0.0693273, 0.148751),
  vec3(0.176511, 0.00674866, 0.0640407),
  vec3(0.128301, 0.0580066, 0.150842),
  vec3(-0.220375, 0.0472335, 0.0231211),
  vec3(0.158084, 0.172418, 0.0839711),
  vec3(-0.0723442, -0.118355, 0.23428),
  vec3(0.284249, -0.0209549, 0.0861435),
  vec3(-0.185662, -0.191458, 0.185738),
  vec3(0.236006, 0.203627, 0.167798),
  vec3(0.0237278, 0.110404, 0.367821),
  vec3(-0.16193, 0.243559, 0.297631),
  vec3(-0.450064, 0.0217133, 0.0296611),
  vec3(0.255695, -0.314067, 0.271539),
  vec3(-0.0463555, 0.0906747, 0.515427),
  vec3(-0.338382, -0.0281134, 0.451516),
  vec3(0.178883, -0.420786, 0.398094),
  vec3(0.222925, -0.196228, 0.577417),
  vec3(-0.193663, 0.195649, 0.637218),
  vec3(-0.474014, 0.533016, 0.199687),
  vec3(-0.23367, 0.530408, 0.53543),
  vec3(0.236102, 0.759278, 0.26822),
  vec3(-0.138816, -0.87978, 0.0250268),
  vec3(0.472589, 0.817058, 0.0373964),
  vec3(0.597074, -0.0263238, 0.801754)
);

float TestOcclusion(mat4 proj, mat3 tbn, vec3 pos, vec3 kernal, float depth, float far, float radius)
{
  vec4 samplePos = vec4(pos + mul(tbn, kernal) * radius, 1.0);
  vec4 sampleUv = mul(proj, samplePos);
  sampleUv.xy = (sampleUv.xy / sampleUv.w) * 0.5 + 0.5;

  float sampleDepth = tex2D(Color0, sampleUv.xy).w * far;
  
  // 1.0 if sample is behind depth buffer, else 0.0
  float depthTest = step(sampleDepth + far * 0.00002, -samplePos.z);
  // 1.0 if sample is within radius distance of pixel origin, else 0.0
  float rangeTest = step(abs(depth - sampleDepth), radius);

  return depthTest * rangeTest;
}

void Ssao(inout Data data)
{
  // Sample geometry buffer
  vec4 geoSample = tex2D(Color0, data.Uv);
  vec3 normal = geoSample.xyz * 2.0 - 1.0;
  float depth = geoSample.w * data.FarClip;

  // Reconstruct position
  vec3 nearPlaneBottomLeft = vec3(NearPlaneSizeView * -0.5, -data.NearClip);
  vec3 nearPlanePosition = nearPlaneBottomLeft + vec3(NearPlaneSizeView * data.Uv, 0);
  vec3 position = nearPlanePosition * (depth / data.NearClip);

  // Sample random texture for hemisphere rotation
  // Want 4x4 sample repeated across the screen
  vec2 randScale = data.ScreenDim / 4.0;
  vec3 randVec = vec3(tex2D(Color1, data.Uv * randScale).xy * 2.0 - 1.0, 0.0);

  // Build change of basis for hemisphere, assumed kernal is in +Z
  vec3 tangent = normalize(randVec - normal * dot(randVec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 tbn = mat3(tangent, bitangent, normal);

  float occlusion = 0.0;

  //for (int i = 0; i < 32; ++i)
  //{
  //  vec4 samplePos = vec4(position + mul(tbn, Kernal[i]) * data.Radius, 1.0);
  //  vec4 sampleUv = mul(data.Projection, samplePos);
  //  sampleUv.xy = (sampleUv.xy / sampleUv.w) * 0.5 + 0.5;
  //
  //  float sampleDepth = tex2D(Color0, sampleUv.xy).w * data.FarClip;
  //
  //  float depthTest = step(sampleDepth, -samplePos.z);
  //  float rangeTest = step(abs(depth - sampleDepth), data.Radius);
  //
  //  occlusion += depthTest * rangeTest;
  //}
  
  // Unrolled for loop
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 0], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 1], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 2], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 3], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 4], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 5], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 6], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 7], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 8], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[ 9], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[10], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[11], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[12], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[13], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[14], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[15], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[16], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[17], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[18], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[19], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[20], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[21], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[22], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[23], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[24], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[25], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[26], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[27], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[28], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[29], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[30], depth, data.FarClip, data.Radius);
  occlusion += TestOcclusion(data.Projection, tbn, position, Kernal[31], depth, data.FarClip, data.Radius);

  occlusion /= 32.0;
  float accessibility = pow(1.0 - occlusion, data.Intensity);

  data.Color = vec4(vec3(accessibility), 1.0);
}

////////////////////////////////////////////////////////////////////////////////
/// SSAO Technique: Sampling random points inside of a sphere
/// Inspired by Crytek's SSAO technique
////////////////////////////////////////////////////////////////////////////////
fragment SSAO_Sphere

inputs
{
	float2 Uv;

	float2 uScreenDim;
    float2 uInvScreenDim;
    float2 uNearFar;
	bool uToggle;
    float3 uSampleKernel[32];

    int uRandomTexSize;
    int uSampleKernelSize;
    float uSampleRadius;
    float uSampleBias;
    float uIntensity;
    float4x4 uProjectionMat;

	texture samplerGeometry;
	texture samplerRandom;
}

outputs
{
	float4 Color;
}

fragmentCode

const float cDefaultAccessibility = 0.5;

void SSAO_Sphere(inout Data data)
{
    const int nSampleNum = 16; // number of samples
    float2 fragmentTC = data.Uv;
    //Repeat the random rotation every 4 pixels
    float2 randomTC  = fragmentTC * data.uScreenDim / 4;
    float3 rotationVector = 2 * tex2D(samplerRandom, randomTC).xyz - 1;

    //Get the depth of the current pixel
    float fragmentWorldDepth = tex2D(samplerGeometry, data.Uv).w * -data.uNearFar.y;

    //For each larger step expand the search radius
    float sampleLength = 0.01 * 0.5;
    float sampleLengthStep = 1 + 2.4/nSampleNum;

    float accessibility = 0;
    // sample the sphere and accumulate accessibility
    for (int i = 0; i < (nSampleNum/8); i++)
    {
        for (int x = -1; x <= 1; x += 2)
        for (int y = -1; y <= 1; y += 2)
        for (int z = -1; z <= 1; z += 2)
        {
            //Get random offset
            float3 offset = normalize(float3(x, y, z)) * sampleLength;

            // Example sphere radius sampling
            sampleLength *= sampleLengthStep;

            // reflect offset vector by random rotation sample (i.e. rotating it)
            float3 rotatedOffset = reflect(offset, rotationVector);

            //Just use the rotatedOffset this wil move in screen space
            float2 sampleTC = fragmentTC + rotatedOffset.xy;

            // read scene depth at sampling point
            float sampleWorldDepth = tex2D(samplerGeometry, sampleTC).w * -data.uNearFar.y + data.uSampleBias;

            // check if depths of both pixels are close enough and sampling point should affect our center pixel
            //float fRangeIsInvalid = saturate((fragmentWorldDepth - sampleWorldDepth) / sampleWorldDepth);

            float fRangeIsInvalid = 0.0;
            if( abs(fragmentWorldDepth - sampleWorldDepth) > uNearFar.y * 0.01)
                fRangeIsInvalid = 1.0;


            // accumulate accessibility, use default value of 0.5 if right computations are not possible
            float r = float(sampleWorldDepth < (fragmentWorldDepth + rotatedOffset.z * 2));
            accessibility += lerp(r, cDefaultAccessibility, fRangeIsInvalid);
        }
    }

    // get average value
    accessibility /= nSampleNum;

    //amplify effect and saturate
    accessibility = pow(1.0 - accessibility, data.uIntensity);

    data.Color = float4(float3(accessibility), 1);
}

////////////////////////////////////////////////////////////////////////////////
/// SSAO Technique: Sample inside of a hemisphere aligned with the normal
/// http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html
/// Not an exact reference, just inspired by this and the Starcraft2 technique
////////////////////////////////////////////////////////////////////////////////
fragment SSAO_Hemisphere

inputs
{
	float2 Uv;

	float2 uScreenDim;
    float2 uInvScreenDim;
    float2 uNearFar;
	bool uToggle;
    float3 uSampleKernel[32];

    int uRandomTexSize;
    int uSampleKernelSize;
    float uSampleRadius;
    float uSampleBias;
    float uIntensity;
    float4x4 uProjectionMat;

	texture samplerGeometry;
	texture samplerRandom;
}

outputs
{
	float4 Color;
}

fragmentCode

float3 ComputePositionFromNDCandDepth( float2 pos2_screen, float depth_camera )
{
  float2 screenSpaceRay = float2( pos2_screen.x / -uProjectionMat[0][0],
                                  pos2_screen.y / -uProjectionMat[1][1] );

  return float3( screenSpaceRay.xy * depth_camera, depth_camera );
}

// Works with OpenGL Texture Coordinates, DirectX might need a flip on Y
float2 TexToNDC2D( float2 pos2_texture )
{
  return pos2_texture * 2.0 - 1.0;
}

void SSAO_Hemisphere(inout Data data)
{
	float2 texFragment = data.Uv;

	//Get the depth of the current pixel
	float depthFragment = -tex2D( samplerGeometry, texFragment ).w * data.uNearFar.y;

	float2 pos2D_NDC = TexToNDC2D( texFragment );
	float3 posFragment = ComputePositionFromNDCandDepth( pos2D_NDC, depthFragment );
	float3 nrmFragment = tex2D( samplerGeometry, texFragment ).xyz * 2.0 - 1.0;
	nrmFragment = normalize( nrmFragment );

	float2 texRandom  = texFragment * ( data.uScreenDim / data.uRandomTexSize );
	float3 vecRandom = tex2D( samplerRandom, texRandom ).xyz * 2.0 - 1.0;

	//// Gram-Schmidt for building an orthogonal basis, unused
	//vec3 tanFragment = normalize( vecRandom - nrmFragment * dot( vecRandom, nrmFragment ) );
	//vec3 bitFragment = cross( nrmFragment, tanFragment );
	//mat3 tbn = mat3( tanFragment, bitFragment, nrmFragment );

	float accessibility = 0;

	for (int i = 0; i < data.uSampleKernelSize; i++)
	{
		// get random offset within a sphere
		float3 vecSample = reflect( uSampleKernel[i], vecRandom );

		// force it to be oriented with our normal
		vecSample *= sign( dot( vecSample, nrmFragment ) );

		// get the position of the sample in camera space
		float3 posSample = vecSample * data.uSampleRadius + posFragment;

		// project our sample into texture coordinates
		float4 texSample = float4( posSample, 1.0 );
		texSample = mul( data.uProjectionMat, texSample );
		texSample /= texSample.w;
		texSample.xy = texSample.xy * 0.5 + 0.5;

		// read scene depth at sampling point
		float depthSample = -tex2D( samplerGeometry, texSample.xy ).w * data.uNearFar.y;

		// is the depth we sampled within our sampling radius?
		float isValidRange = abs( depthFragment - depthSample ) < data.uSampleRadius ? 1.0 : 0.0;

		// is the depth we sampled closer than the one read ( z values are in camera space )
		accessibility += ( depthSample >= (posSample.z + data.uSampleBias) ? isValidRange : 0.0 );
	}

	accessibility = pow( 1.0 - (accessibility / data.uSampleKernelSize), data.uIntensity);

	data.Color = float4( float3( accessibility ), 1.0 );
}

