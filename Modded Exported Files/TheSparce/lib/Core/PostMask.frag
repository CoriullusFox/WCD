Pixel

fragment PostMask

inputs
{
  float2 Uv;

  texture Color0;
  texture Color1;
}

outputs
{
  float4 Color;
}

fragmentCode

void PostMask(inout Data data)
{
  data.Color = tex2D(Color0, data.Uv) * tex2D(Color1, data.Uv);
}
