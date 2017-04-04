Pixel

fragment PostFog

inputs
{
	float2 Uv;
	texture Color0;
	texture Color1;
	float  FogBeginDepth;
	float  FogEndDepth;
	float  FogBeginDensity;
	float  FogEndDensity;
	float4 FogColor;

	float3 WorldFrustumVector;
	float3 WorldFrustumNearPosition;
		
}

outputs
{
	float4 Color;
}

fragmentCode

void PostFog(inout Data data)
{
    //float linerDepth = -tex2D(Color1, data.Uv).w;
    //float depth = linerDepth * data.FogFarPlane;
    
    float linearDepth = -tex2D(Color1, data.Uv).w;
	float3 worldPosition = data.WorldFrustumVector * linearDepth;	  
    float depth = length(worldPosition);    
    float4 currentColor = tex2D(Color0, data.Uv);   
	
    float totalDepthDelta = data.FogEndDepth - data.FogBeginDepth; 
    float totalDensityDelta = data.FogEndDensity - data.FogBeginDensity;    
    float relativeDepthDelta = depth - data.FogBeginDepth;    
    float density = data.FogBeginDensity + (relativeDepthDelta / totalDepthDelta) * totalDensityDelta;
    density = clamp(density, data.FogBeginDensity, data.FogEndDensity);    
    float fogFactor = 1.0 - density;    
    
    data.Color = lerp(data.FogColor, currentColor, fogFactor);	    
}



fragment PostFogExp

inputs
{
	float2 Uv;
	texture Color0;
	texture Color1;
	float  FogStart;
	float  FogDensity;	
	float4 FogColor;
	float3 WorldFrustumVector;
	float3 WorldFrustumNearPosition;
		
}

outputs
{
	float4 Color;
}

fragmentCode

void PostFogExp(inout Data data)
{   
    float linearDepth = -tex2D(Color1, data.Uv).w;
	float3 worldPosition = data.WorldFrustumVector * linearDepth;	  
    float depth = length(worldPosition);   
	
    float4 currentColor = tex2D(Color0, data.Uv);  
	
    depth = max(0, depth - FogStart);	
	
    float fogFactor = exp2(-FogDensity * depth );	

    data.Color = lerp(data.FogColor, currentColor, fogFactor);	    
}
