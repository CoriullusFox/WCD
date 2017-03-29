Pixel

fragment PostBlurX

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

void PostBlurX(inout Data data)
{
	float step = InvScreenDim.y;
	vec2 uv = data.Uv;
	vec4 sum = vec4(0.0);
	sum += tex2D(Color0, vec2(uv.x, uv.y - 6.0 * step)) * 0.002216;	  
	sum += tex2D(Color0, vec2(uv.x, uv.y - 5.0 * step)) * 0.008764;   
	sum += tex2D(Color0, vec2(uv.x, uv.y - 4.0 * step)) * 0.026995;
	sum += tex2D(Color0, vec2(uv.x, uv.y - 3.0 * step)) * 0.064759;
	sum += tex2D(Color0, vec2(uv.x, uv.y - 2.0 * step)) * 0.120985;
	sum += tex2D(Color0, vec2(uv.x, uv.y - 1.0 * step)) * 0.176033;
	sum += tex2D(Color0, vec2(uv.x, uv.y             )) * 0.199471;
	sum += tex2D(Color0, vec2(uv.x, uv.y + 1.0 * step)) * 0.176033;
	sum += tex2D(Color0, vec2(uv.x, uv.y + 2.0 * step)) * 0.120985;
	sum += tex2D(Color0, vec2(uv.x, uv.y + 3.0 * step)) * 0.064759;
	sum += tex2D(Color0, vec2(uv.x, uv.y + 4.0 * step)) * 0.026995;
	sum += tex2D(Color0, vec2(uv.x, uv.y + 2.0 * step)) * 0.008764;
	sum += tex2D(Color0, vec2(uv.x, uv.y + 3.0 * step)) * 0.002216;
	data.Color = sum;
}


fragment PostBlurY

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

void PostBlurY(inout Data data)
{ 
	float step = InvScreenDim.x;
	vec2 uv = data.Uv;
	vec4 sum = vec4(0.0);
	sum += tex2D(Color0, vec2(uv.x - 6.0 * step, uv.y)) * 0.002216;	  
	sum += tex2D(Color0, vec2(uv.x - 5.0 * step, uv.y)) * 0.008764;   
	sum += tex2D(Color0, vec2(uv.x - 4.0 * step, uv.y)) * 0.026995;
	sum += tex2D(Color0, vec2(uv.x - 3.0 * step, uv.y)) * 0.064759;
	sum += tex2D(Color0, vec2(uv.x - 2.0 * step, uv.y)) * 0.120985;
	sum += tex2D(Color0, vec2(uv.x - 1.0 * step, uv.y)) * 0.176033;
	sum += tex2D(Color0, vec2(uv.x             , uv.y)) * 0.199471;
	sum += tex2D(Color0, vec2(uv.x + 1.0 * step, uv.y)) * 0.176033;
	sum += tex2D(Color0, vec2(uv.x + 2.0 * step, uv.y)) * 0.120985;
	sum += tex2D(Color0, vec2(uv.x + 3.0 * step, uv.y)) * 0.064759;
	sum += tex2D(Color0, vec2(uv.x + 4.0 * step, uv.y)) * 0.026995;
	sum += tex2D(Color0, vec2(uv.x + 2.0 * step, uv.y)) * 0.008764;
	sum += tex2D(Color0, vec2(uv.x + 3.0 * step, uv.y)) * 0.002216;
	data.Color = sum;
}