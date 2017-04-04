Pixel

fragment PostCopy

inputs
{
	float2 Uv;
	texture Color0;
}

outputs
{
	float4 Color;
}

fragmentCode void PostCopy(inout Data data)
{
	data.Color = tex2D(Color0, data.Uv);
}


fragment PostCopyFlip

inputs
{
	float2 Uv;
	texture Color0;
}

outputs
{
	float4 Color;
}

fragmentCode void PostCopyFlip(inout Data data)
{
	data.Uv.y = 1.0 - data.Uv.y;
	data.Color = tex2D(Color0, data.Uv);
}

fragment PostCombine

inputs
{
	float2 Uv;
	texture Color0;
	texture Color1;
}

outputs
{
	float4 Color;
}

fragmentCode void PostCombine(inout Data data)
{
	float4 a = tex2D(Color0, data.Uv);
	float4 b = tex2D(Color1, data.Uv);
	data.Color = a + b;
}

fragment PostIntensifyLight

inputs
{
	float2 Uv;
	texture Color0;
	texture Color1;
	float Intensity;
}

outputs
{
	float4 Color;
}

fragmentCode void PostIntensifyLight(inout Data data)
{
  // When the intensity is 0, it should not affect the scene
  // (technically should not even be ran!)
  // When the intensity is +1, the light should increase
  // When the intensity is -1, the light should decrease
	float4 a = tex2D(Color0, data.Uv);
	float4 b = tex2D(Color1, data.Uv);
  
  float interpolant = (data.Intensity > 0);
  float increaseTerm = (a * pow(b + 1, float4(+data.Intensity)));
  float decreaseTerm = (a * pow(b,     float4(-data.Intensity)));
  float4 unclamped = interpolant * increaseTerm + (1 - interpolant) * decreaseTerm;
  
	data.Color = clamp(unclamped, 0, 1);
}


fragment PostModulate

inputs
{
	float2 Uv;
	float4 ModulateColor;
	texture Color0;
}

outputs
{
	float4 Color;
}

fragmentCode void PostModulate(inout Data data)
{
	float4 a = tex2D(Color0, data.Uv);
	data.Color = a * data.ModulateColor;
}

fragment PostDownSample

inputs
{
	float2 Uv;
	float2 InvScreenDim;
	texture Color0;
}

outputs
{
	float4 Color;
}

fragmentCode

void PostDownSample(inout Data data)
{
	float4 average = float4(0,0,0,0);
	
	average += tex2D(Color0, data.Uv + float2(-1,-1) * data.InvScreenDim);
	average += tex2D(Color0, data.Uv + float2( 1,-1) * data.InvScreenDim);
	average += tex2D(Color0, data.Uv + float2( 1, 1) * data.InvScreenDim);
	average += tex2D(Color0, data.Uv + float2(-1, 1) * data.InvScreenDim);
								
	data.Color = average * 0.25f;
}

fragment PostHighPass

inputs
{
	float BrightThreshold;
	float4 Color;
}

outputs
{
	float4 Color;
}

fragmentCode

const float4 black = float4(0);

void PostHighPass(inout Data data)
{
	float4 color = data.Color;
	float4 bright = float4(BrightThreshold);	
	data.Color = max(color - bright, black);
}
