Pixel

fragment Basic

inputs
{
	float2 Uv;
	float4 VertexColor;
	texture Texture0;
}

outputs
{
	float4 Color;
}

fragmentCode

void Basic(inout Data data)
{
	data.Color = data.VertexColor * tex2D(Texture0, data.Uv);
}

fragment BasicAdd

inputs
{
	float2 Uv;
	float4 VertexColor;
	texture Texture0;
}

outputs
{
	float4 Color;
}

fragmentCode

void BasicAdd(inout Data data)
{
	data.Color = data.VertexColor + tex2D(Texture0, data.Uv);
}