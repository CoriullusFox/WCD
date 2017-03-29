Pixel

fragment PostRefract

inputs
{
	texture Color0;
	texture Color1;
	float2 Uv;
}

outputs
{
	float4 Color;
}

fragmentCode

void PostRefract(inout Data data)
{
  float2 baseOffset = tex2D(Color1, data.Uv).xy;
  data.Color = tex2D(Color0, data.Uv + baseOffset);
}