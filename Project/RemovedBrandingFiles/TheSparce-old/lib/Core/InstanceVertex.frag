InstancedVertex

//////////Basic Vertex//////////////
fragment VertexProjectedInstanced

inputs
{
	float4x4 WorldViewProjection;
	float4x4 ViewProjection;
	float4x4 World;
	uint InstanceId;

	float3 Position;
}

outputs
{
	float4 Projected;
}

fragmentCode void VertexProjectedInstanced(in VertexInput Input, inout VsOutput Output)
{
	Output.Projected = mul(WorldMatrixArray[Input.InstanceId], float4(Input.Position, 1) );
	Output.Projected = mul(ViewProjection, Output.Projected);
}


fragment VertexNormalInstanced

inputs
{
	float4x4 View;
	float3 Normal;
	uint InstanceId;
}

outputs
{
	float3 Normal;
}

fragmentCode void VertexNormalInstanced(in VertexInput Input, inout VsOutput Output)
{
	Output.Normal = normalize(mul(WorldMatrixArray[Input.InstanceId], float4(Input.Normal, 0) ).xyz);
	Output.Normal = mul(View, float4(Output.Normal, 0)).xyz;
}

/////////Vertex for normal maps//////////////
fragment VertexNormalMapInstanced

inputs
{
	float3 Tangent;
	float3 Bitangent;
	uint InstanceId;
}

outputs
{
	float3 Tangent;
	float3 Bitangent;
}

fragmentCode void VertexNormalMapInstanced(in VertexInput Input, inout VsOutput Output)
{
	Output.Tangent = normalize(mul(WorldMatrixArray[Input.InstanceId], float4(Input.Tangent, 0) ).xyz);
	Output.Bitangent = normalize(mul(WorldMatrixArray[Input.InstanceId], float4(Input.Bitangent, 0) ).xyz);
}


//////////Vertex Uv//////////////
fragment VertexUvInstanced

inputs
{
	float2 Uv;
}

outputs
{
	float2 Uv;
}

fragmentCode void VertexUvInstanced(in VertexInput Input, inout VsOutput Output)
{
	Output.Uv = Input.Uv;
}

//////////////Position////////////

fragment VertexPositionInstanced

inputs
{
	float3 Position;
	uint InstanceId;
}

outputs
{
	float3 PixelPosition;
}

fragmentCode void VertexPositionInstanced(in VertexInput Input, inout VsOutput Output)
{
	Output.PixelPosition = mul(WorldMatrixArray[Input.InstanceId], float4(Input.Position, 1) ).xyz;
}


fragment VertexScreenInstanced

inputs
{
	float4 Projected;
}

outputs
{
	float4 Screen;
}

fragmentCode void VertexScreenInstanced(in VertexInput Input, inout VsOutput Output)
{
	Output.Screen = Output.Projected;
}
