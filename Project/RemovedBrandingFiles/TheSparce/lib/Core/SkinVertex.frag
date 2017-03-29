SkinnedVertex

fragment VertexProjectedSkin

inputs
{
	float4x4 WorldViewProjection;
	float3 Position;
	float4 BlendWeights;
	float4 BlendIndices;
	float4x4 WorldMatrixArray[80];
}

outputs
{
	float4 Projected;
}

fragmentCode

void VertexProjectedSkin(inout Data data)
{
	float4 weight = data.BlendWeights;
	float4 index = data.BlendIndices;

	float3 blendedPos = float3(0, 0, 0);
	for (int boneIndex = 0; boneIndex < 4; ++boneIndex)
		blendedPos += mul(WorldMatrixArray[int(index[boneIndex])], float4(data.Position, 1) ).xyz * weight[boneIndex];

	data.Projected = mul(data.WorldViewProjection, float4(blendedPos, 1) );
}


fragment VertexNormalSkin

inputs
{
	float4x4 WorldView;
	float3 Normal;
	float4 BlendWeights;
	float4 BlendIndices;
	float4x4 WorldMatrixArray[80];
}

outputs
{
	float3 Normal;
}

fragmentCode

void VertexNormalSkin(inout Data data)
{
	float4 weight = data.BlendWeights;
	float4 index = data.BlendIndices;

	float3 blendedNormal = float3(0, 0, 0);
	for (int boneIndex = 0; boneIndex < 4; ++boneIndex)
		blendedNormal += mul(WorldMatrixArray[int(index[boneIndex])], float4(data.Normal, 0) ).xyz * weight[boneIndex];

	data.Normal = normalize(mul(WorldView, float4(blendedNormal, 0) ).xyz);
}

fragment VertexNormalMapSkin

inputs
{
	float3 Tangent;
	float4 BlendWeights;
	float4 BlendIndices;
	float4x4 WorldView;
	float4x4 WorldMatrixArray[80];
}

outputs
{
	float3 Tangent;
	float3 Bitangent;
}

fragmentCode

void VertexNormalMapSkin(inout Data data)
{
	float4 weight = data.BlendWeights;
	float4 index = data.BlendIndices;

	float3 blendedTangent = float3(0, 0, 0);

	for (int boneIndex = 0; boneIndex < 4; ++boneIndex)
		blendedTangent += mul(WorldMatrixArray[int(index[boneIndex])], float4(data.Tangent, 0) ).xyz * weight[boneIndex];

	data.Tangent = normalize(mul(WorldView, float4(blendedTangent, 0) ).xyz);
	data.Bitangent = cross(data.Normal, data.Tangent);
}

fragment VertexPositionSkin

inputs
{
	float4x4 WorldView;
	float3 Position;
	float4x4 WorldMatrixArray[80];
}

outputs
{
	float3 PixelPosition;
}

fragmentCode

void VertexPositionSkin(inout Data data)
{
	float4 weight = data.BlendWeights;
	float4 index = data.BlendIndices;

	float3 blendedPos = float3(0, 0, 0);
	for (int boneIndex = 0; boneIndex < 4; ++boneIndex)
		blendedPos += mul(WorldMatrixArray[int(index[boneIndex])], float4(data.Position, 1) ).xyz * weight[boneIndex];

	data.PixelPosition = mul(WorldView, float4(blendedPos, 1) ).xyz;
}

fragment VertexScreenSkin

inputs
{
	float3 Position;
}

outputs
{
	float4 Screen;
}

fragmentCode

void VertexScreenSkin(inout Data data)
{
	data.Screen = data.Projected;
}
