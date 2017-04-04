// Ring warp effect
Pixel

fragment PostRingWarp

inputs
{
	texture Color0;
	texture Color1;
	
	float2 Uv;
	float  RWSize;
	float  RWThickness;
	float  RWIntensity;
	float2 RWPositionNDC;
	float  RWAspectRatio;
}

outputs
{
	float4 Color;
}

fragmentCode

void PostRingWarp(inout Data data)
{
  // Compute our position in NDC
  float2 positionNdc = (data.Uv * 2.0f - 1.0f);
  
  float2 difference = (positionNdc - RWPositionNDC);
  difference.y /= RWAspectRatio;
  
  float diffLength = length(difference);
  
  float2 direction = difference / diffLength;
  
  // A [0,1] value, where 0 is the edge, 1 is right on the ring
  float closeToRing = max(RWThickness - abs(diffLength - RWSize), 0) / RWThickness;
  
  const float PI = 3.141592653589793238f;
  
  float magnitude = (cos((1.0f - closeToRing) * PI) + 1.0f) / 2.0f;
  
  data.Color =  float4(direction * magnitude * RWIntensity, 0.0f, 1.0f);
}
