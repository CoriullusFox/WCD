Pixel

fragment CommonGlsl

inputs
{
}

outputs
{
}

fragmentCode

// GLSL specific defines;
#define float2 vec2
#define float3 vec3
#define float4 vec4
#define float2x2 mat2
#define float3x3 mat3
#define float4x4 mat4
#define atan2 atan

#define ArrayStart(type) type[](
#define ArrayEnd )
#define Constant const

#define saturate(v) clamp(v,0.0,1.0)
#define lerp(a,b,t) mix(a,b,t)
#define mul(a,b) (a*b)

//doesn't have truncate, but casting to an integer will truncate...
float trunc(float value){return float(int(value));}
float2 trunc(float2 value){return float2(ivec2(value));}
float3 trunc(float3 value){return float3(ivec3(value));}
float4 trunc(float4 value){return float4(ivec4(value));}
//zilch binds Sign(real) : int, but glsl has Sign(real) : real so cast it away
int Sign(float value){return int(sign(value));}
ivec2 Sign(float2 value){return ivec2(sign(value));}
ivec3 Sign(float3 value){return ivec3(sign(value));}
ivec4 Sign(float4 value){return ivec4(sign(value));}
//mod which is a dumb version of fmod that uses floor instead
//r (produces weird results), replace this with an hlsl style fmod
float fmod(float dividend, float divisor){return dividend - divisor * trunc(dividend / divisor);}
float2 fmod(float2 dividend, float2 divisor){return dividend - divisor * trunc(dividend / divisor);}
float3 fmod(float3 dividend, float3 divisor){return dividend - divisor * trunc(dividend / divisor);}
float4 fmod(float4 dividend, float4 divisor){return dividend - divisor * trunc(dividend / divisor);}

float3 MultiplyNormal(float4x4 m, float3 v){float4 result = mul(m, float4(v.x, v.y, v.z, 0.0)); return result.xyz;}
float2 MultiplyNormal(float3x3 m, float2 v){float3 result = mul(m, float3(v.x, v.y, 0.0)); return result.xy;}
float3 MultiplyPoint(float4x4 m, float3 v){float4 result = mul(m, float4(v.x, v.y, v.z, 1.0)); return result.xyz / result.w;}
float2 MultiplyPoint(float3x3 m, float2 v){float3 result = mul(m, float3(v.x, v.y, 1.0)); return result.xy / result.z;}

float4 lit(float NdotL, float NdotH, float m)
{
	float ambient = 1.0;
	float diffuse = max(NdotL, 0.0);
	float specular = step(0.0, NdotL) * pow(max(NdotH, 0.0), m);
	return vec4(ambient, diffuse, specular, 1.0);
}

fragment CommonHlsl

inputs
{
}

outputs
{
}

fragmentCode

#define ArrayStart(type) {
#define ArrayEnd }
#define Constant static const


fragment Common

inputs
{
}

outputs
{
}

fragmentCode


float2 ProjectedToUv(float4 projected) 
{
	float2 uv = 0.5 * (projected.xy / projected.w ) + float2( 0.5, 0.5 );
	//uv.y = 1.0 - uv.y;
	return uv;
}

float3 GetViewPositionDepth(float3 viewPos, float z, float farPlane)
{
	float3 worldView = viewPos;
	float3 viewDirection = float3(worldView.xy * (farPlane / worldView.z), farPlane);
	return z * viewDirection;
}

