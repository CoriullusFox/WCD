Pixel

fragment ViewColor

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

void ViewColor(inout Data data)
{
	data.Color = data.VertexColor * tex2D(Texture0, data.Uv);
	data.Color.a = 1.0;
}

fragment ViewColor10

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

void ViewColor10(inout Data data)
{
	data.Color = data.VertexColor * abs(tex2D(Texture0, data.Uv)) * 10;
	data.Color.a = 1.0;
}

fragment ViewDepth

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

void ViewDepth(inout Data data)
{
	float depth = tex2D(Texture0, data.Uv).w;
	float adjusted = abs(cos(depth * 500));
	data.Color = float4(adjusted, adjusted, adjusted, 1);
}

fragment RenderDepthShadow

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

void RenderDepthShadow(inout Data data)
{
	float r = 0.5 * tex2D(Texture0, data.Uv).r + 0.5;
	data.Color = float4(r, r, r, 1);
}
