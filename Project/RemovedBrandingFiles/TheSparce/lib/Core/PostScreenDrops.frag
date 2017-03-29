Pixel

fragment PostScreenDrops

inputs
{
	int     SDCount;
	float   SDAspectRatio;
	float2  SDPositionNDC[160];
	float   SDSize[160];
	float   SDIntensity[160];
	float2  Uv;
}

outputs
{
	float4 Color;
}

fragmentCode

void PostScreenDrops(inout Data data)
{
  const float IntensityScale = 10.0f;

  // Compute our position in NDC
  float2 positionNdc = (data.Uv * 2.0f - 1.0f);

  float2 accumulation = float2(0);

  for (int i = 0; i < SDCount; ++i)
  {
    float2 difference = (positionNdc - SDPositionNDC[i]);
    difference.y /= SDAspectRatio;
  
    float diffLength = length(difference);
  
    float2 direction = difference / diffLength;

    // [0,1] value, 0 is the center, 1 is the edge
    float normLength = min(diffLength / SDSize[i], 1);

    const float PI = 3.141592653589793238f;
    float magnitude = cos(normLength * (PI / 2.0f));
  
    magnitude = max(magnitude, 0.0f);

    float2 flippedDiff = difference;
    flippedDiff.y = -flippedDiff.y;

    accumulation += flippedDiff * IntensityScale * magnitude * SDIntensity[i];
  }

  data.Color = float4(accumulation, 0.0f, 1.0f);	
}
