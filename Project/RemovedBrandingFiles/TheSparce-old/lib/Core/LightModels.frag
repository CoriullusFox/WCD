Pixel

///////////////Lambert Lighting/////////////

fragment Lambert

inputs
{
	float LightIntensity;
	float3 LightDirection;
	float LightDistance;
	float4 LightColor;
	float3 Normal;
}

outputs
{
	float4 Lighting;
	float Specular;
}

fragmentCode void Lambert(inout Data data)
{
	float lighting = saturate(dot(data.Normal, data.LightDirection)) * data.LightIntensity;
	data.Lighting += data.LightColor * lighting;
	data.Specular = 0;
}


//////////Phong Lighting/////////////////

fragment Phong

inputs
{
	float3 LightDirection;
	float LightIntensity;
	float LightDistance;
	float3 Normal;
	float SpecularExponent;
	float4 LightColor;
	float3 PixelPosition;
}

outputs
{
	float4 Lighting;
	float Specular;
}

fragmentCode void Phong(inout Data data)
{
	float3 halfAngleVector = normalize(normalize(-data.PixelPosition) + data.LightDirection);
	float4 lighting = lit(dot(data.LightDirection, data.Normal), dot(halfAngleVector, data.Normal), data.SpecularExponent);
	float4 diffuseContrib = lighting.y * data.LightColor;
	float specularContrib = lighting.y * lighting.z;
	data.Lighting +=  diffuseContrib * data.LightIntensity;
	data.Specular = specularContrib * data.LightIntensity;
}


///////////Ambient////////////////

fragment Ambient

inputs
{
	float4 LightAmbient;
	float4 SurfaceColor;
}


outputs
{
	float4 Lighting;
}

fragmentCode void Ambient(inout Data data)
{
	data.Lighting += data.LightAmbient;
}


//////////ApplyLighting//////////////////////

fragment ApplyLighting

inputs
{
	float4 Lighting;
	float Specular;
	float SpecularScalar;
	float4 LightColor;
	float4 SurfaceColor;
	float4 Additive;	
}

outputs
{
	float4 Color;
}

fragmentCode void ApplyLighting(inout Data data)
{
	data.Color = data.SurfaceColor * data.Lighting + data.Additive + data.SpecularScalar * data.Specular * data.LightColor;		
	data.Color.a = data.SurfaceColor.a;
}


//////////ApplyColor//////////////////////

fragment ApplyColor

inputs
{
	float4 SurfaceColor;
	float4 Lighting;
	float4 Additive;
}

outputs
{
	float4 Color;
}

fragmentCode void ApplyColor(inout Data data)
{
	data.Color = data.SurfaceColor + data.Additive;
}
