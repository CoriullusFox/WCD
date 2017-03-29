Pixel

fragment PostMotionBlur

inputs
{
	float2 Uv;
	float3 WorldFrustumNearPosition;
	float3 WorldFrustumVector;

	bool     MBRadialOnly;
	int      MBSamples;
	float    MBDensity;
	float4x4 MBOldViewProjection;
	float4x4 MBNewViewProjection;
	
	texture Color0;
	texture Color1;	
}

outputs
{
	float4 Color;
}

fragmentCode

// Samples the 'w' component of the geobuffer
// Screen coords must be in [0, 1] coordinate space
// Returns depth in [0, 1], where 0 is the near plane and 1 is the far plane
float GetNormalizedDepth(sampler2D geoBuffer, float2 screenCoords)
{
  return -tex2D(geoBuffer, screenCoords).w;
}

void PostMotionBlur(inout Data data)
{ 
  // Get the uv
  float2 uv = data.Uv;
  
  // If the effect is radial only, we make a scalar that goes from [0, 1]
  // 0 being the center of the screen and 1 being the edges
  float radialEffect = MBRadialOnly ? length(uv - float2(0.5f, 0.5f)) : 1.0f;
  
  // Sample the geometry buffer (get the depth out of the geo buffer)
  float depth = GetNormalizedDepth(Color0, uv);
  
  // Get the world position by projecting out along the depth (using positions on the near plane)
  float3 worldPosition = data.WorldFrustumNearPosition + data.WorldFrustumVector * depth;
  
  // Compute the old and new NDC positions of the world position, using the old and new ViewPojection matrices
  float4 oldNDCPosition = mul(MBOldViewProjection, float4(worldPosition, 1.0f));
  float4 newNDCPosition = mul(MBNewViewProjection, float4(worldPosition, 1.0f));
  
  // Move to actual NDC space [-1, 1]
  oldNDCPosition /= oldNDCPosition.w;
  newNDCPosition /= newNDCPosition.w;
  
  // Get the difference between the 2D points on the screen
  float2 difference = (newNDCPosition.xy - oldNDCPosition.xy);
  
  // Check if either it's a background (skybox, or the difference wasn't enough to blur)
  if (depth > 0.99999f || length(difference) < 0.00001f)
  {
    // Early out and just return the sampled color
    data.Color = tex2D(Color1, uv);
    return;
  }
  
  
  // Store the color that we're going to accumulate and average (the blurred color
  float4 color = float4(0);
  
  // Determine the half samples
  int halfSamples = MBSamples / 2;
  
  // Count the number of samples we actually make
  int sampleCount = 0;
  
  // Now walk from negative half to positive half (note that this could actually add one sample)
  for (int i = -halfSamples; i <= halfSamples; ++i)
  {
    // Increment the sample count
    ++sampleCount;
    
    
    // Determine the offset based off the index and the density (take into account sample count)
    float delta = i * MBDensity / MBSamples;
    
    // Determine the sample offset
    float2 sampleOffset = difference * delta * radialEffect;
    
    // Determine the sample position based on the passed in texture position and sample offset
    float2 samplePos = uv + sampleOffset;
    
    // Now sample and accumulate the colors
    color += tex2D(Color1, clamp(samplePos, float2(0,0), float2(1,1)) );
  }
  
  // Divide the color out by the same count (average it to get a blur)
  color /= sampleCount;
  
  // Return the pixel's color
  data.Color = color;
}