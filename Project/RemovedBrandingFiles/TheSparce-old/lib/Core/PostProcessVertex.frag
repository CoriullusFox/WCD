PostProcessVertex

fragment PostVertex

inputs
{
	float3 Position;
}

outputs
{
	float4 Projected;
}

fragmentCode

void PostVertex(inout Data data)
{
	data.Projected = float4(data.Position, 1);
}

fragment PostWorldFrustrums

inputs
{
	float3 WorldFrustumNearPositions[4];
	float3 WorldFrustumVectors[4];
	float Index;
}

outputs
{
	float3 WorldFrustumNearPosition;
	float3 WorldFrustumVector;
}

fragmentCode 

void PostWorldFrustrums(inout Data data)
{
  data.WorldFrustumNearPosition = WorldFrustumNearPositions[int(data.Index)];
  data.WorldFrustumVector = WorldFrustumVectors[int(data.Index)];
}