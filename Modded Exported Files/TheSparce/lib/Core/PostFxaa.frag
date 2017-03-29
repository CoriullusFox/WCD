Pixel

fragment PostFxaa

inputs
{
	texture Color0;
	float2 Uv;
	float2 InvScreenDim;
}

outputs
{
	float4 Color;
}

fragmentCode 

const float3 cLuma = float3(0.299, 0.587, 0.114);
const float cFxaaSpanMax = 8.0;
const float cFxaaReduceMin = 1 / 128;
const float cFxaaReduceMul = 1 / 8.0;

void PostFxaa(inout Data data)
{	
    // Sample around the current pixel
    float3 rgbNW = texture2D(Color0, data.Uv + (float2(-1.0, -1.0) * data.InvScreenDim)).xyz;
    float3 rgbNE = texture2D(Color0, data.Uv + (float2(+1.0, -1.0) * data.InvScreenDim)).xyz;
    float3 rgbSW = texture2D(Color0, data.Uv + (float2(-1.0, +1.0) * data.InvScreenDim)).xyz;
    float3 rgbSE = texture2D(Color0, data.Uv + (float2(+1.0, +1.0) * data.InvScreenDim)).xyz;
    float3 rgbM  = texture2D(Color0, data.Uv).xyz;

    // Calculate luminance for each pixel
    float lumaNW = dot(rgbNW, cLuma);
    float lumaNE = dot(rgbNE, cLuma);
    float lumaSW = dot(rgbSW, cLuma);
    float lumaSE = dot(rgbSE, cLuma);
    float lumaM  = dot(rgbM,  cLuma);
    
    // Blur direction
    float2 blurDir;
    blurDir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    blurDir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    
    // Used to not divide by 0
    float cornerLuma = (lumaNW + lumaNE + lumaSW + lumaSE);
    float dirReduce = max(cornerLuma * (0.25 * cFxaaReduceMul), cFxaaReduceMin);
    
    float rcpDirMin = 1.0 / (min(abs(blurDir.x), abs(blurDir.y)) + dirReduce);
    
    blurDir = min(float2(cFxaaSpanMax,  cFxaaSpanMax), 
              max(float2(-cFxaaSpanMax, -cFxaaSpanMax), blurDir * rcpDirMin)) * data.InvScreenDim;
        
    float3 sample0 = 0.5 * (
                texture2D(Color0, data.Uv + blurDir * (1.0/3.0 - 0.5)).xyz +
                texture2D(Color0, data.Uv + blurDir * (2.0/3.0 - 0.5)).xyz);
    float3 sample1 = sample0 * 0.5 + 0.25 * (
                texture2D(Color0, data.Uv + blurDir * (0.0/3.0 - 0.5)).xyz +
                texture2D(Color0, data.Uv + blurDir * (3.0/3.0 - 0.5)).xyz);
    
    float luma1 = dot(sample1, cLuma);
    
    // Min and Max luminance values
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    
    // If it's outside the luminance range, use the first sample
    if((luma1 < lumaMin) || (luma1 > lumaMax))
    {
        data.Color.xyz = sample0;
    }
    else
    {
        data.Color.xyz = sample1;
    }
    
    data.Color.a = 1.0;
}