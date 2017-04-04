Pixel

/////////////////Diffuse Texture Surface Color/////////////

fragment TextureDiffuse

inputs
{
  texture Diffuse;
  float2 Uv;
  float2 DiffuseScroll;
  float2 DiffuseOffset;
  float2 DiffuseTiling;
  float Time;
}

outputs
{
  float4 SurfaceColor;
}

fragmentCode void TextureDiffuse(inout Data data)
{
  float2 Uv = (data.Uv + data.DiffuseOffset + data.DiffuseScroll * data.Time) * data.DiffuseTiling;
  data.SurfaceColor = tex2D(Diffuse, Uv);
}

/////////////////Diffuse Texture Surface Color/////////////

fragment ModulateModelColor

inputs
{
  float4 ObjectColor;
}

outputs
{
  float4 SurfaceColor;
}

fragmentCode void ModulateModelColor(inout Data data)
{
  data.SurfaceColor = data.SurfaceColor * data.ObjectColor;
}

////////////Color Diffuse////////////////

fragment ColorDiffuse

inputs
{
  float4 DiffuseColor;
}

outputs
{
  float4 SurfaceColor;
}

fragmentCode void ColorDiffuse(inout Data data)
{
  data.SurfaceColor = data.DiffuseColor;
}


////////////Normal Mapping/////////////////

fragment NormalMapping

inputs
{
  texture NormalMap;
  float2 Uv;
  float3 Normal;
  float3 Tangent;
  float3 Bitangent;
  float Bumpiness;
  float2 NormalOffset;
  float2 NormalTiling;
  float2 NormalScroll;
  float Time;
}

outputs
{
  float3 Normal;
}

fragmentCode void NormalMapping(inout Data data)
{
  float3 Nn = normalize(data.Normal);
  float3 Tn = normalize(data.Tangent);
  float3 Bn = normalize(data.Bitangent);
  float2 Uv = (data.Uv + data.NormalOffset + data.NormalScroll * data.Time) * data.NormalTiling;
  float3 nrm = tex2D(NormalMap, Uv).xyz;

  float3 bump = data.Bumpiness * (nrm - 0.5);
  Nn = Nn + Tn * bump.x - Bn * bump.y;
  data.Normal = normalize(Nn);
}


////////////Do Not Block God Rays/////////////////

fragment DoNotBlockGodRays

inputs
{
  float3 PixelPosition;
  float3 Normal;
}

outputs
{
  float3 PixelPosition;
  float3 Normal;
}

fragmentCode void DoNotBlockGodRays(inout Data data)
{
  data.Normal = float3(0);
  data.PixelPosition = float3(1000000);
}

////////////Light Emissive///////////////

fragment EmissiveMapping

inputs
{
  texture EmissiveMap;
  float2 Uv;
  float4 SurfaceColor;
  float EmissiveScale;
  float4 ObjectColor;
  float2 EmissiveScroll;
  float2 EmissiveOffset;
  float2 EmissiveTiling;
  float Time;
}

outputs
{
  float4 Additive;
}

fragmentCode void EmissiveMapping(inout Data data)
{
  float2 Uv = (data.Uv + data.EmissiveOffset + data.EmissiveScroll * data.Time) * data.EmissiveTiling;
  data.Additive.rgb += tex2D(EmissiveMap, Uv).rgb * data.ObjectColor.rgb * data.EmissiveScale;
}


/////////////////Specular  Mapping//////////
fragment SpecularMapping

inputs
{
  texture SpecularMap;
  float2 Uv;
  float SpecularScalar;
  float2 SpecularScroll;
  float2 SpecularOffset;
  float2 SpecularTiling;
  float Time;
}

outputs
{
  float SpecularScalar;
}

fragmentCode void SpecularMapping(inout Data data)
{
  float2 uv = (data.Uv + data.SpecularOffset +  data.SpecularScroll * data.Time) * data.SpecularTiling;
  data.SpecularScalar *= tex2D(SpecularMap, uv).r;
}

fragment SpecularFromAlpha

inputs
{
  float4 SurfaceColor;
}

outputs
{
  float4 SurfaceColor;
  float SpecularScalar;
}

fragmentCode void SpecularFromAlpha(inout Data data)
{
  data.SpecularScalar = data.SurfaceColor.a;
  data.SurfaceColor.a = 1;
}

//////////////Light Projection/////////////

fragment MaskGobo

inputs
{
  texture GoboMap;
  float4x4 LightProjection;
  float3 PixelPosition;
  float LightIntensity;
}

outputs
{
  float LightIntensity;
}

fragmentCode void MaskGobo(inout Data data)
{
  //Project Pixel Poistion onto texture map
  float4 projectedPosition = mul( LightProjection, float4(data.PixelPosition, 1.0f) );
  float2 projectedUv = 0.5 * projectedPosition.xy / projectedPosition.w + float2(0.5, 0.5);
  projectedUv.y = 1.0f - projectedUv.y;

  float4 mapColor = tex2D(GoboMap, projectedUv);
  data.LightIntensity = mapColor.r;
}

//////////////Light Projection Color/////////////

fragment ColorGobo

inputs
{
  texture GoboMap;
  float4x4 LightProjection;
  float3 PixelPosition;
  float4 LightColor;
}

outputs
{
  float4 LightColor;
}

fragmentCode void ColorGobo(inout Data data)
{
  float4 projectedPosition = mul( LightProjection, float4(data.PixelPosition, 1.0f));
  float2 projectedUv = 0.5 * projectedPosition.xy / projectedPosition.w + float2(0.5, 0.5);
  projectedUv.y = 1.0f - projectedUv.y;

  float4 lightColor = tex2D(GoboMap, projectedUv);
  data.LightColor = lightColor * data.LightColor;
}
