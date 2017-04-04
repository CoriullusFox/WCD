Pixel


// Depricated
fragment StoreDepth

inputs
{
  float3 PixelPosition;
  float FarDistance;
}

outputs
{
  float4 Color;
}

fragmentCode void StoreDepth(inout Data data)
{
  //Pixel position is in view space
  float linearDepth = -data.PixelPosition.z / data.FarDistance;

  //Store depth into output
  data.Color = float4(linearDepth, 1, 1, 1);
}

fragment Shadow

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
}

outputs
{
}

fragmentCode

void Shadow(inout Data data)
{
  float3 shadowTex = ProjectToShadowUv(ShadowProjection[0], data.PixelPosition + data.Normal * data.NormalOffsetBias);
  float shadowFactor = texShadow(ShadowMap, shadowTex);
  data.LightColor = lerp(data.ShadowColor, data.LightColor, shadowFactor);
}


fragment ShadowPcf3x3

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 InvTextureSize;
}

outputs
{
}

fragmentCode

void ShadowPcf3x3(inout Data data)
{
  float3 shadowTex = ProjectToShadowUv(ShadowProjection[0], data.PixelPosition + data.Normal * data.NormalOffsetBias);
  float shadowFactor = PcfSampler3x3(shadowTex, data.InvTextureSize[0]);
  data.LightColor = lerp(data.ShadowColor, data.LightColor, shadowFactor);
}


fragment ShadowPcf5x5

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 InvTextureSize;
}

outputs
{
}

fragmentCode

void ShadowPcf5x5(inout Data data)
{
  float3 shadowTex = ProjectToShadowUv(ShadowProjection[0], data.PixelPosition + data.Normal * data.NormalOffsetBias);
  float shadowFactor = PcfSampler5x5(shadowTex, data.InvTextureSize[0]);
  data.LightColor = lerp(data.ShadowColor, data.LightColor, shadowFactor);
}


fragment ShadowPcf7x7

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 InvTextureSize;
}

outputs
{
}

fragmentCode

void ShadowPcf7x7(inout Data data)
{
  float3 shadowTex = ProjectToShadowUv(ShadowProjection[0], data.PixelPosition + data.Normal * data.NormalOffsetBias);
  float shadowFactor = PcfSampler7x7(shadowTex, data.InvTextureSize[0]);
  data.LightColor = lerp(data.ShadowColor, data.LightColor, shadowFactor);
}


fragment ShadowCascaded

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 LightColors[4];
  float4 ShadowNearDistance;
  float4 ShadowFarDistance;
}

outputs
{
}

fragmentCode

void ShadowCascaded(inout Data data)
{
  int slice = GetSliceIndex(data.PixelPosition.z, data.ShadowNearDistance, data.ShadowFarDistance);

  float3 shadowTex = ProjectToShadowUv(ShadowProjection[slice], data.PixelPosition + data.Normal * (data.NormalOffsetBias * pow(2.0,float(slice))));
  shadowTex.xy = ShiftUvToSlice(shadowTex.xy, slice);
  float shadowFactor = texShadow(ShadowMap, shadowTex);
  data.LightColor = lerp(data.ShadowColor, LightColors[slice], shadowFactor);
}


fragment ShadowCascadedPcf3x3

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 LightColors[4];
  float4 ShadowNearDistance;
  float4 ShadowFarDistance;
  float4 InvTextureSize;
}

outputs
{
}

fragmentCode

void ShadowCascadedPcf3x3(inout Data data)
{
  int slice = GetSliceIndex(data.PixelPosition.z, data.ShadowNearDistance, data.ShadowFarDistance);

  float3 shadowTex = ProjectToShadowUv(ShadowProjection[slice], data.PixelPosition + data.Normal * (data.NormalOffsetBias * pow(2.0,float(slice))));
  shadowTex.xy = ShiftUvToSlice(shadowTex.xy, slice);
  float shadowFactor = PcfSampler3x3(shadowTex, data.InvTextureSize[slice]);
  data.LightColor = lerp(data.ShadowColor, LightColors[slice], shadowFactor);
}


fragment ShadowCascadedPcf5x5

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 LightColors[4];
  float4 ShadowNearDistance;
  float4 ShadowFarDistance;
  float4 InvTextureSize;
}

outputs
{
}

fragmentCode

void ShadowCascadedPcf5x5(inout Data data)
{
  int slice = GetSliceIndex(data.PixelPosition.z, data.ShadowNearDistance, data.ShadowFarDistance);

  float3 shadowTex = ProjectToShadowUv(ShadowProjection[slice], data.PixelPosition + data.Normal * (data.NormalOffsetBias * pow(2.0,float(slice))));
  shadowTex.xy = ShiftUvToSlice(shadowTex.xy, slice);
  float shadowFactor = PcfSampler5x5(shadowTex, data.InvTextureSize[slice]);
  data.LightColor = lerp(data.ShadowColor, LightColors[slice], shadowFactor);
}


fragment ShadowCascadedPcf7x7

inputs
{
  float4x4 ShadowProjection[4];
  textureShadow ShadowMap;
  float NormalOffsetBias;
  float3 Normal;
  float3 PixelPosition;
  float4 ShadowColor;
  float4 LightColors[4];
  float4 ShadowNearDistance;
  float4 ShadowFarDistance;
  float4 InvTextureSize;
}

outputs
{
}

fragmentCode

void ShadowCascadedPcf7x7(inout Data data)
{
  int slice = GetSliceIndex(data.PixelPosition.z, data.ShadowNearDistance, data.ShadowFarDistance);

  float3 shadowTex = ProjectToShadowUv(ShadowProjection[slice], data.PixelPosition + data.Normal * (data.NormalOffsetBias * pow(2.0,float(slice))));
  shadowTex.xy = ShiftUvToSlice(shadowTex.xy, slice);
  float shadowFactor = PcfSampler7x7(shadowTex, data.InvTextureSize[slice]);
  data.LightColor = lerp(data.ShadowColor, LightColors[slice], shadowFactor);
}

fragment ShadowUtilities

inputs
{
}

outputs
{
}

fragmentCode

void ShadowUtilities(inout Data data)
{
  // Sentinal function for compositor
}

int GetSliceIndex(float pixelZ, float4 nearDistances, float4 farDistances)
{
  float absZ = abs(pixelZ);
  float4 absZVec = float4(absZ, absZ, absZ, absZ);

  bvec4 maskNear = greaterThanEqual(absZVec, nearDistances);
  bvec4 maskFar = lessThan(absZVec, farDistances);

  float4 maskFinal = float4(maskNear) * float4(maskFar);
  float4 slices = float4(0.0, 1.0, 2.0, 3.0);

  // index 0, 1, 2, or 3?
  return int(dot(slices, maskFinal));
}

float3 ProjectToShadowUv(float4x4 shadowProjection, float3 pixelPosition)
{
  // Project the pixel into the shadow space
  float4 positionInShadow = mul(shadowProjection, float4(pixelPosition, 1.0));

  // NDC to UV
  float3 shadowTex = positionInShadow.xyz;
  shadowTex = 0.5 * (shadowTex / positionInShadow.w) + 0.5;

  return shadowTex;
}

float2 ShiftUvToSlice(float2 uv, int slice)
{
  uv *= 0.5;
  uv.x += float(mod(slice, 2) * 0.5);
  uv.y += float((slice / 2) * 0.5);
  return uv;
}

float PcfSampler3x3(float3 uv, float sampleStep)
{
  float sampleSum = 0.0;

  sampleSum += texShadow(ShadowMap, uv + float3(-1.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  1.0, 0.0) * sampleStep);

  return sampleSum / 9.0;
}

float PcfSampler5x5(float3 uv, float sampleStep)
{
  float sampleSum = 0.0;

  sampleSum += texShadow(ShadowMap, uv + float3(-2.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  2.0, 0.0) * sampleStep);

  return sampleSum / 25.0;
}

float PcfSampler7x7(float3 uv, float sampleStep)
{
  float sampleSum = 0.0;

  sampleSum += texShadow(ShadowMap, uv + float3(-3.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0, -3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-3.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0, -2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-3.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0, -1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-3.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0,  0.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-3.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0,  1.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-3.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0,  2.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-3.0,  3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-2.0,  3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3(-1.0,  3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 0.0,  3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 1.0,  3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 2.0,  3.0, 0.0) * sampleStep);
  sampleSum += texShadow(ShadowMap, uv + float3( 3.0,  3.0, 0.0) * sampleStep);

  return sampleSum / 49.0;
}
