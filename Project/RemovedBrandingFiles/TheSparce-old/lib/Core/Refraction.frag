Pixel

fragment ApplyRefraction

inputs
{
	float Refraction;	
	
    float3 Normal;	
	float3 PixelPosition;
	float4 Screen;
	float FarDistance;	
	
	texture Geometry;
}

outputs
{
	float4 Color;
}

fragmentCode 

float GetViewDepth(float2 uv, float farPlane)
{
	return tex2D(Geometry , uv).a * farPlane;
}

void ApplyRefraction(inout Data data)
{
    float2 screenUv = ProjectedToUv(data.Screen);    
    float3 currentViewPos = data.PixelPosition;	
	float currentDepth = -currentViewPos.z;
	    
    float3 viewNormal = data.Normal;
    float2 offset = viewNormal.xy * 0.05 * data.Refraction ;
	    
	// Check for depth overlap	
	float2 offsetUv = screenUv + offset;	
	float sampledDepth = GetViewDepth(offsetUv, data.FarDistance);

    if(sampledDepth < currentDepth)
        data.Color = float4(0,0,0,0);
	else		
		data.Color = float4(offset.x,offset.y,0, 1);
}
