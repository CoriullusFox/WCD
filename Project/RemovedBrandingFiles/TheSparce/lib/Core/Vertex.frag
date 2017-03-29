ModelVertex

fragment VertexProjected

inputs
{
  float4x4 WorldViewProjection;
  float3 Position;
}

outputs
{
  float4 Projected;
}

fragmentCode

void VertexProjected(inout Data data)
{
  data.Projected = mul(WorldViewProjection, float4(data.Position, 1.0));
}

fragment VertexNormal

inputs
{
  float4x4 WorldView;
  float3 Normal;
}

outputs
{
  float3 Normal;
}

fragmentCode

void VertexNormal(inout Data data)
{
  // WorldView should be the inverse transposed
  data.Normal = normalize(mul(WorldView, float4(data.Normal, 0.0)).xyz);
}

fragment VertexNormalMap

inputs
{
  float4x4 WorldView;
  float3 Tangent;
  float3 Bitangent;
}

outputs
{
  float3 Tangent;
  float3 Bitangent;
}

fragmentCode

void VertexNormalMap(inout Data data)
{
  // WorldView should be the inverse transposed
  data.Tangent = normalize(mul(WorldView, float4(data.Tangent, 0.0)).xyz);
  data.Bitangent = normalize(mul(WorldView, float4(data.Bitangent, 0.0)).xyz);
}

fragment VertexPosition

inputs
{
  float4x4 WorldView;
}

outputs
{
  float3 PixelPosition;
}

fragmentCode

void VertexPosition(inout Data data)
{
  data.PixelPosition = mul(WorldView, float4(data.Position, 1.0)).xyz;
}

fragment VertexScreen

inputs
{
  float3 Position;
}

outputs
{
  float4 Screen;
}

fragmentCode

void VertexScreen(inout Data data)
{
  data.Screen = data.Projected;
}
