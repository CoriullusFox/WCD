Pixel

///////////////Refractivity See-Through/////////////

fragment RefractivitySeeThrough

inputs
{
	float3 Normal;
}

outputs
{
	float4 Color;
}

fragmentCode void RefractivitySeeThrough(inout Data data)
{
	const float3 KeyDirectionalLightView = normalize(float3(-0.3f, -0.8f, 0.15f));
	const float LightFactor = 0.45f;

	float3 color = float3(1.0f, 0.0f, 0.0f);

	float fullTerm = dot(-KeyDirectionalLightView, data.Normal);
	float lightTerm = fullTerm * LightFactor;

	data.Color = float4(float3(lightTerm,lightTerm,lightTerm), 1.0f);
}

///////////////Refractivity Diffuse/////////////

fragment RefractivityDiffuse

inputs
{
	float4 SurfaceColor;
}

outputs
{
	float4 Color;
}

fragmentCode void RefractivityDiffuse(inout Data data)
{
	data.Color = data.SurfaceColor;
}

///////////////Refractivity/////////////

fragment Refractivity

inputs
{
	float3 Normal;
	float4 SurfaceColor;
}

outputs
{
	float4 Color;
}

fragmentCode void Refractivity(inout Data data)
{
	data.Color = float4(data.Normal.xy, 0.0, 1.0);
}


///////////////AlphaTest/////////////

fragment AlphaTest

inputs
{
	float4 SurfaceColor;
	float AlphaTestValue;
}

outputs
{
  float4 SurfaceColor;
  
  // Force alpha test to always
  // be used
  float4 Color;	
}

fragmentCode void AlphaTest(inout Data data)
{
	if (data.SurfaceColor.a < data.AlphaTestValue)
		discard;
  
  // This may seem strange, but if you don't force the alpha of a texture to be 1
  // then when it attempts to draw it will introduce the standard alpha-blending + depth kill problem
  data.SurfaceColor.a = 1.0f;
}



///////////////WeightedTextures/////////////

fragment WeightedTextures

inputs
{
	texture Texture0;
	texture Texture1;
	texture Texture2;
	texture Texture3;
	texture WeightTexture;
	float2 Uv;
	float2 Tile0;
	float2 Tile1;
	float2 Tile2;
	float2 Tile3;
}

outputs
{
  float4 SurfaceColor;
}

fragmentCode void WeightedTextures(inout Data data)
{
	float4 weights = tex2D(WeightTexture, data.Uv);

	float2 sampelUv = data.Uv;
	float4 color0 = tex2D(Texture0, sampelUv * Tile0);
	float4 color1 = tex2D(Texture1, sampelUv * Tile1);
	float4 color2 = tex2D(Texture2, sampelUv * Tile2);
	float4 color3 = tex2D(Texture3, sampelUv * Tile3);
	
	data.SurfaceColor = color0 * weights.r + color1 * weights.g + color2 * weights.b + color3 * weights.a;
}

///////////////AutoFlipNormal/////////////

fragment AutoFlipNormal

inputs
{
	float3 Normal;
}

outputs
{
    float3 Normal;
}

fragmentCode void AutoFlipNormal(inout Data data)
{
	// If the triangle is facing away from the
	// view flip the normal so lighting will
	// work on back faces	
	if(!gl_FrontFacing)
	{
		data.Normal = -data.Normal;
	}
}

