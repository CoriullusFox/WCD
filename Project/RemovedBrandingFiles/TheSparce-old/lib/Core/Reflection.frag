Pixel

fragment ApplyReflection

inputs
{
	float4 SurfaceColor;
	float4 Lighting;
	float4 Additive;
	float ReflectFinalScalar;
    float ReflectScalar;
    float ReflectEnvironmentScalar;
}

outputs
{
	float4 Color;
}

fragmentCode 

void ApplyReflection(inout Data data)
{
	data.Color += float4(data.ReflectFinalScalar, data.ReflectScalar, data.ReflectEnvironmentScalar, 1);
	data.Color.a = 1;
}

fragment ScreenSpaceReflectionMap

inputs
{
    texture ReflectMap;
    float ReflectFinalScalar;
    float ReflectScalar;
    float ReflectEnvironmentScalar;
    float2 Uv;
}

outputs
{
    float ReflectFinalScalar;
    float ReflectScalar;
    float ReflectEnvironmentScalar;
}

fragmentCode

void ScreenSpaceReflectionMap(inout Data data)
{
    float sampleStrength = tex2D(ReflectMap, data.Uv).x;
    data.ReflectFinalScalar = data.ReflectFinalScalar * sampleStrength;
}
