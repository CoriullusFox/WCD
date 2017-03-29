Pixel

fragment ReflectiveMapping

inputs
{
  texture ReflectiveMap;
  float2 Uv;
}

outputs
{
  float Reflectivity;
}

fragmentCode void ReflectiveMapping(inout Data data)
{
  data.Reflectivity = tex2D(ReflectiveMap, data.Uv).r;
}

fragment ReflectiveSpherical

inputs
{
  texture Environment;
  float Reflectivity;
  float3 Normal;
  float3 PixelPosition;
  float2 ReflectiveScroll;
  float Time;
}

outputs
{
  float4 Additive;
}

fragmentCode 

Constant float pi = 3.141592653589793238462643383;
  
void ReflectiveSpherical(inout Data data)
{  
  float3 r = reflect(normalize(-data.PixelPosition), data.Normal);
  float u = (atan2(r.z, r.x) / pi) * 0.5 + 0.5;
  float v = 0.5 + asin(r.y) / pi;
  float2 uv = float2(u, v) + float2(data.ReflectiveScroll * data.Time);
  data.Additive += tex2D(Environment, uv) * data.Reflectivity;  
}

fragment ReflectiveCube 

inputs
{
  textureCube Environment;
  mat4 ViewInverse;
  float Reflectivity;
  float3 Normal;
  float3 PixelPosition;
  float2 ReflectiveScroll;
  float Time;
}

outputs
{
  float4 Additive;
}

fragmentCode 
  
void ReflectiveCube(inout Data data)
{
  float3 r = reflect(normalize(data.PixelPosition), data.Normal);
  r = mul(ViewInverse, float4(r, 0.0)).xyz;

  float4 color = texCUBE(Environment, r);
  data.Additive += color * data.Reflectivity;
}


fragment EnvironmentSpherical

inputs
{
  texture Environment;
  float3 Normal;
}

outputs
{
  float4 Color;
}

fragmentCode 

Constant float pi = 3.141592653589793238462643383;
  
void EnvironmentSpherical(inout Data data)
{  
  float3 r = normalize(data.Normal); 
  float u = (atan2(r.z, r.x) / pi) * 0.5 + 0.5;
  float v = 0.5 - asin(r.y) / pi;
  float2 uv = float2(u, v);
  data.Color += tex2D(Environment, uv);  
}

fragment EnvironmentCube

inputs
{
  textureCube Environment;
  float3 Normal;
}

outputs
{
  float4 Color;
}

fragmentCode 
  
void EnvironmentCube(inout Data data)
{  
  float4 color  = texCUBE(Environment, normalize(data.Normal));
  data.Color = color;  
}
