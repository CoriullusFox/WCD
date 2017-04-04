Pixel

////////////Parallax///////////////

fragment ParallaxOcclusionMapping

inputs
{
  texture ParallaxMap;
  float2 Uv;
  float ParallaxScale;
  float Time;
  float3 Normal;
  float3 Bitangent;
  float3 Tangent;
  float3 PixelPosition;
  int MinimumSamples;
  int MaximumSamples;
  bool Silhouette;
  bool AmbientOcclusion;
}

outputs
{
  float2 Uv;
}

fragmentCode void ParallaxOcclusionMapping(inout Data data)
{
  //float3x3 tangentToWorldSpace;
  //tangentToWorldSpace[0] = mul(float4(data.Tangent,  0), WorldView).xyz;
  //tangentToWorldSpace[1] = mul(float4(data.Bitangent, 0), WorldView).xyz;
  //tangentToWorldSpace[2] = mul(float4(data.Normal,   0), WorldView).xyz;
  //float3x3 worldToTangentSpace = transpose(tangentToWorldSpace);

  // Create a matrix that takes any vector from world to tangent space
  // Note that 'world' does not actually mean world, because sometimes the world-view gets passed in as world
  float3x3 worldToTangentSpace;
  worldToTangentSpace[0] = data.Tangent;
  worldToTangentSpace[1] = data.Bitangent;
  worldToTangentSpace[2] = data.Normal;

  // Store the view direction (this makes it easy for us to change it all over)
  // The negative comes from the fact that we actually want the vector pointing from the pixel to the eye
  float3 toEyeViewDirection = -normalize(data.PixelPosition);
  //float3 toEyeViewDirection = data.ViewDirection; // No negative is needed here since it's flipped in C++

  // We transpose the matrix since the inverse of a rotation is simply a tranpose, and we want
  // to take vectors from world to tangent, not tangent to world
  worldToTangentSpace = transpose(worldToTangentSpace);

  // Convert the view direction from world space into tangent space
  float3 viewDirectionT = normalize(mul(toEyeViewDirection, worldToTangentSpace));

  // Also convert the normal into tangent space (does this even make sense? won't it always be the same?)
  float3 normalT = normalize(mul(data.Normal, worldToTangentSpace));


  // Note: For any of the below [DEBUG] tags, there must be no other material blocks that overwrite the SurfaceColor

  // [DEBUG] The dot product between the normal and the view direction should give us essentially what is a directional
  //         light that is coming from the camera (facing in the view direction)
  //         We do not need to apply a negative sign because the vector is already pointing to the eye
  //data.SurfaceColor = float4(float3(dot(toEyeViewDirection, data.Normal)), 1.0f);

  // [DEBUG] Debug draw the normals, tangents, and bitangents
  //         In forward rendering, these are in world space and do not move with the camera
  //         In deferred, these are in view space and therefore will change with the camera's rotation
  //data.SurfaceColor = float4(data.Normal,   1.0f);
  //data.SurfaceColor = float4(data.Tangent,  1.0f);
  //data.SurfaceColor = float4(data.Bitangent, 1.0f);

  // [DEBUG] Confirm that the vectors are orthonormal (though technically they could be the zero vector...)
  //#define OrthoCheck(a, b) (abs(dot((a), (b))) * 50.0f)
  //data.SurfaceColor = OrthoCheck(data.Normal, data.Tangent) + OrthoCheck(data.Normal, data.Bitangent) + OrthoCheck(data.Bitangent, data.Tangent);

  // [DEBUG] In tangent space, the view direction's z represents the perpendicular component to the surface
  //         This means that if we look directly at the surface, the z should be 1.0f
  //         In this debug test, it should look like a directional light coming from the camera (white surfaces when you face them)
  //data.SurfaceColor = viewDirectionT.z;


  // [DEBUG] As per my intuition, if you transform the normal back into tangent space, it's somewhat silly since the normal
  //         will always be in the z-direction (eg, perpendicular to the surface, just like the above eye.z debug sample
  //         This means that the normal should always show up as blue, from every direction, no matter what the surface is
  //data.SurfaceColor = float4(normalT, 1.0f);

  // I don't actually understand this part, I think it has to do with offset limiting
  // Maybe we could make some sense of this parameter?
  // It seems this has to do with perspective...
  float parallaxLimit = length(viewDirectionT.xy) / viewDirectionT.z;
  parallaxLimit *= data.ParallaxScale;

  // [DEBUG] Draw the parallax limit. When looking orthogonal to a surface, the parallax limit would be zero.
  //         When looking nearly tangent to a surface, the parallax limit seems to grow to infinity.
  //data.SurfaceColor = float4(float3(parallaxLimit), 1.0f);

  // Compute the offset (this is basically how much we step tangentially to the plane)
  float2 offset = normalize(-viewDirectionT.xy);

  //HACK
  offset.y = -offset.y;

  // [DEBUG] Draw the offset vector. Not sure how to make sense of it yet.
  // data.SurfaceColor = float4(offset, 0.0f, 1.0f);

  // Apply the parallax limit to the offset (which takes into account our input parallax scale)
  offset *= parallaxLimit;


  // Determine the number of samples by performing the dot product between the normal and the view direction
  // This part makes no sense to me because it seems like you'd want more samples as you look to the side (tangentially)
  // If you face orthogonally to the surface, then the dot product is 1, resulting in MaxSamples
  // If you face tangentially to the surface, then the dot product is 0, resulting in MinSamples
  float samplesFactor = dot(viewDirectionT, normalT);

  // [DEBUG] Draw the offset vector. Not sure how to make sense of it yet.
  //data.SurfaceColor = float4(float3(samplesFactor), 1.0f);

  // Lerp to get the number of samples
  int numSamples = (int)lerp(data.MaximumSamples, data.MinimumSamples, samplesFactor);

  // The percentage that we change each step based on the number of samples
  // Also, since our height always goes from [0, 1] and has no true units (hence the scale)
  // then this step size can be used as the change in height for each step
  float stepSize = 1.0f / (float)numSamples;

  // Add an epsilon to the step size since it's possible to never hit the ground
  stepSize += 0.005f;

  // We pre-compute the gradient because we cannot use dynamic branching in loops that
  // have to compue the gradient themselves (I guess it's a GPU thing...)
  float2 dx, dy;
  dx = ddx(data.Uv);
  dy = ddy(data.Uv);

  // Compute the amount we will step tangentially in the loop below
  // As a good rule of thumb, any float2s below are tangential
  float2 offsetStep = stepSize * offset;

  // Store the current offset, last offset, and final offset
  // Is this all really needed? I feel like this could be majorly refactored
  float2 currentOffset = float2(0, 0);
  float2 lastOffset    = float2(0, 0);

  // Store the current texture sample and the last texture sample as we walk the height/normal map
  // Note that these are the parallax texture samples (not the diffuse texture samples)
  float4 currentSample;
  float4 lastSample;

  // Start at a height of 1 (basically at the surface, we will walk down with our ray as it steps)
  float currentHeight = 1.0f;

  // How many times have we sampled thus far (this is our iterator)
  int sampleCount = 0;

  // Loop until we hit the top number of samples
  while (sampleCount < numSamples)
  {
    // Sample the texture (the alpha channel is the current height at the sampled position)
    currentSample = tex2D(ParallaxMap, data.Uv + currentOffset, dx, dy);

    // If the height of the parallax map is greater than the current height that we stepped to
    // This means that we intersected the height map!
    if (currentSample.a > currentHeight)
    {
      // This is basically a linear approximation of where the intersection point actually lies
      float sampledHeightDiff = currentSample.a - lastSample.a;
      float linearApproximation = (lastSample.a - (currentHeight + stepSize)) / (stepSize + (sampledHeightDiff));
      currentOffset = lastOffset - linearApproximation * offsetStep;

      // This essentially breaks out of the loop by causing the condition to be false
      // Why do this instead of just using 'break' ?
      sampleCount = numSamples + 1;
    }
    else
    {
      // Otherwise, we did not intersect and we need to keep stepping...
      sampleCount++;

      // Walk the ray downward...
      currentHeight -= stepSize;

      // Store the last offset
      lastOffset = currentOffset;

      // Add the current offset to the step
      currentOffset += offsetStep;

      // Store the last sample
      lastSample = currentSample;
    }
  }

  // Offset the final UV position
  data.Uv += currentOffset;

  // If the user want's silhouette (eg clipping where the tex-coords go outside of the bounds)
  if (data.Silhouette)
  {
    // the amount we let the texture coordinates go outside the bounds
    const float Buffer = 0.0f;

    // Check if the tex-coordinates are inside the desired range
    float isValid = (float)(data.Uv.x >= -Buffer && data.Uv.x < 1.0f + Buffer && data.Uv.y >= -Buffer && data.Uv.y < 1.0f + Buffer);

    // Clip the pixel if they are not
    clip(isValid - 0.5f);
  }


  // Grab the final sample so we can use the normal at that point (for lighting)
  float4 finalSample = tex2D(ParallaxMap, data.Uv, dx, dy);

  float ambientOcclusionScale = 1.0f;

  if (data.AmbientOcclusion)
  {
    ambientOcclusionScale = 0.0f;
    const int aoIterations = 3;
    const float sampleScaleUv = 0.1f;

    const float aoTexScale = (1.0f / aoIterations) * sampleScaleUv;

    const int aoT = aoIterations * 2 + 1;
    const float aoTotalIterations = aoT * aoT;
    float aoSampleDelta = 1.0f / aoTotalIterations;

    for (int y = -aoIterations; y <= aoIterations; ++y)
    {
      for (int x = -aoIterations; x <= aoIterations; ++x)
      {
        float4 aoSample = tex2D(ParallaxMap, data.Uv + float2(x, y) * aoTexScale, dx, dy);

        // If the height is greater than ours...
        ambientOcclusionScale += ((float)(aoSample.a < finalSample.a)) * aoSampleDelta;
      }
    }
  }

  // Determine the bump map scale by using the normal portion of the final sample
  float3 bump = /*data.ParallaxScale * */(finalSample.rgb - 0.5f);

  // Output the normal using the nVidia bump map technique
  data.Normal = normalize(data.Normal + bump.x * data.Tangent - bump.y * data.Bitangent) * ambientOcclusionScale;
}
