
Pixel

fragment PostEdgeBlurX

inputs
{
	float2 InvScreenDim;
	float2 ScreenDim;
	float FarClip;
	float2 Uv;
	
	texture Color0;
	texture Color1;
}

outputs
{
	float4 Color;
}

fragmentCode

float DepthBlur(float2 uv, float2 offset)
{
    const int NumberOfSamples = 4;
    float refDef = tex2D(Color1, uv).w;
    float sum = 0;
    float samples = 0.0;
    float maxDepth = 0.3 / FarClip;
    for(int i = -NumberOfSamples; i <= NumberOfSamples; ++i)
    {
        float2 offUv = uv + offset * i;
        float testDepth = tex2D(Color1, offUv).w;
        float coef = float(abs(testDepth - refDef) < maxDepth);
        sum += tex2D(Color0, offUv).r * coef;
        samples += coef;
    }
    return sum / samples;
}

void PostEdgeBlurX(inout Data data)
{
    float s = DepthBlur(data.Uv, float2(data.InvScreenDim.x, 0));
    data.Color = float4(s,s,s,0);
}

fragment PostEdgeBlurY

inputs
{
	float2 InvScreenDim;
	float2 ScreenDim;
	float FarClip;
	float2 Uv;
	
	texture Color0;
	texture Color1;
}

outputs
{
	float4 Color;
}

fragmentCode

float DepthBlur(float2 uv, float2 offset)
{
    const int NumberOfSamples = 4;
    float refDef = tex2D(Color1, uv).w;
    float sum = 0;
    float samples = 0.0;
    float maxDepth = 0.3 / FarClip;
    for(int i = -NumberOfSamples; i <= NumberOfSamples; ++i)
    {
        float2 offUv = uv + offset * i;
        float testDepth = tex2D(Color1, offUv).w;
        float coef = float(abs(testDepth - refDef) < maxDepth);
        sum += tex2D(Color0, offUv).r * coef;
        samples += coef;
    }
    return sum / samples;
}

void PostEdgeBlurY(inout Data data)
{
    float s = DepthBlur(data.Uv, float2(0, data.InvScreenDim.y));
    data.Color = float4(s,s,s,0);
}
