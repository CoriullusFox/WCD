BasicVertex

fragment BasicVertex

inputs
{
	float3 Position;
	float4x4 WorldViewProjection;
}

outputs
{
	float4 Projected;
}

fragmentCode

void BasicVertex(inout Data data)
{
	data.Projected = mul(data.WorldViewProjection, float4(data.Position, 1));
}