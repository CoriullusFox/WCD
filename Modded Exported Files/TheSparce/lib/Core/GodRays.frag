Pixel

fragment PostGodRays

// God rays effect
inputs
{
	float2 Uv;
	
	float2 GRLScreenPos;
	float  GRLDepth;
	float4 GRLColor;
	float  GRLIntensity;
	float  GRLScreenRadius;
	float  GRLOccluderClarity;
	
	texture Color0;
	texture Color1;
}

outputs
{
	float4 Color;
}

fragmentCode

void PostGodRays(inout Data data)
{ 
  const int GRLSamples = 80;
  
  float2 uv = data.Uv;
  
  // Get the vector going from the current pixel position to the screen position
  float2 delta = GRLScreenPos - uv;
  
  // Get the distance from the current pixel the light position (for attenuation)
  float pixelDistance = length(delta);
  
  // The delta needs to be scaled by the number of samples, as well as the density parameter
  delta *= (1.0 / float(GRLSamples));
  
  // The total accumulated light for this pixel
  float accumulated = 0.0f;
  
  // Start our interpolant at the current pixel (basically our accumlated step)
  float2 interpolant = uv;
  
  // If the current pixel is within the light's screen radius...
  if (pixelDistance <= GRLScreenRadius)
  { 
    // Loop through and perform all the samples
    for (int numSamples = 0; numSamples < GRLSamples; ++numSamples)
    {
      // Get the depth at the sampled position
      float occluderDepth = tex2D(Color0, interpolant).w;
      
      // In ours, we don't actually use the 'sample' so much as we use the depth
      // If the occluder is behind the light, then the sample is considered lit (or 1.0)
      float sample = float(occluderDepth >= GRLDepth);
      
      // Add the sample to the total
      accumulated += sample;
      
      // Step the ray forward (iterate to the next sample)
      interpolant += delta;
    }
    
    // Compute the radial attenuation factor
    float radialAttenuation = 1.0f - (pixelDistance / GRLScreenRadius);
    
    // Square the radial attenuation (makes the curve quadratic instead of linear, and it looks better)
    radialAttenuation *= radialAttenuation;
    
    // Divide the accumulation by the number of samples we took (normalize it out)
    accumulated /= GRLSamples;
    
    // Lastly, attenuate out the light by the pixel distance
    accumulated *= radialAttenuation;
    
    // Sample our current pixel's depth (used for clarity)
    float ourPixelDepth = tex2D(Color0, uv).w;
    
    // Reduce light bleeding effects over our own occluders (makes them more clear)
    // Basically, when the current pixel is in front of the light, we dampen down the light effect
    accumulated *= 1.0f - float(ourPixelDepth < GRLDepth) * GRLOccluderClarity;
    
    // Apply exposure to the accumulation
    accumulated *= GRLIntensity;
  }
  
  // Start the final color as the original color of the screen
  float4 finalColor = tex2D(Color1, uv);
  
  // Add in the light (and apply the light's color)
  finalColor += GRLColor * float4(float3(accumulated), 1.0f);
  
  // Return the pixel's color
  data.Color =  finalColor;
}