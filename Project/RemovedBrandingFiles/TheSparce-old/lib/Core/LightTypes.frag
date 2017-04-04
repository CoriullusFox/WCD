Pixel

//////////////Directional Light////////////////////////

fragment DirectionalLight

inputs
{
}

outputs
{
	float LightIntensity;
	float LightDistance;
}

fragmentCode void DirectionalLight(inout Data data)
{
	data.LightDistance = 0;
	data.LightIntensity = 1;
}

///////////////Box Light///////////////

fragment BoxLight

inputs
{
	float3 PixelPosition;
	float LightRadius;
	float LightWidth;
	float4x4 LightSpace;
}

outputs
{
	float LightIntensity;
	float LightDistance;
}

fragmentCode void BoxLight(inout Data data)
{
	data.LightDistance = 0;

	// Get position in light coordinates in order to clamp boundaries
	float4 pos = LightSpace * float4(data.PixelPosition, 1.0);

	// Radius and width passed in are full box dimensions
	// Want to clamp using half widths
	float r = data.LightRadius * 0.5f;
	float w = data.LightWidth * 0.5f;

	// Clamp x and y using width
	float lit = ceil(max((w - abs(pos.x)) / w, 0.0));
	lit = min(lit, ceil(max((w - abs(pos.y)) / w, 0.0)));
	// LightSpace z-origin is not in center of box, have to offset pixel pos
	float rBool = ceil(max((r - abs(pos.z + r)) / r, 0.0));
	// Scaling denominator for falloff at end of box
	float falloffScalar = max((r * 2.0 + pos.z) / (r * 0.2), 0.0);
	lit = min(lit, rBool * falloffScalar);

	data.LightIntensity = lit;
}


//////////////Point Light///////////

fragment PointLight

inputs
{
	float3 LightPosition;
	float3 PixelPosition;
	float LightRadius;
	float LightFalloff;
}

outputs
{
	float3 LightDirection;
	float LightIntensity;
	float LightDistance;
}

fragmentCode void PointLight(inout Data data)
{
	float3 lightVector = data.LightPosition - data.PixelPosition;
	data.LightDirection = normalize(lightVector);
	data.LightDistance = length(lightVector);
	float r = ( data.LightRadius -  data.LightDistance ) / data.LightRadius;
	data.LightIntensity = pow(saturate(r), LightFalloff);
}

/////////////Spot Light///////////
fragment SpotLight

inputs
{
	float3 LightDirection;
	float3 LightPosition;
	float3 PixelPosition;
	float3 SpotAngles;
	float LightRadius;
	float LightFalloff;
}

outputs
{
	float LightIntensity;
	float3 LightDirection;
	float LightDistance;
}

fragmentCode void SpotLight(inout Data data)
{
	float3 lightVector = data.LightPosition - data.PixelPosition;
	float3 lightDirection = normalize( lightVector );

	//Compute the spot factor
	float rho = saturate(dot(lightDirection, data.LightDirection));

	//factor = (rho - cos(outer/2) / cos(inner/2) - cos(outer/2)) ^ falloff
	float spotFactor = pow(saturate(rho - data.SpotAngles.y) / (data.SpotAngles.x - data.SpotAngles.y), data.SpotAngles.z);
	//float spotFactor = pow(saturate(rho - cos( 1.5/2) ) / (cos( 0.5/2) - cos( 1.5/2) ), 1 );

	data.LightDistance = length(lightVector);
	float r = ( data.LightRadius -  data.LightDistance ) / data.LightRadius;
	data.LightIntensity = pow(saturate(r), LightFalloff) * spotFactor;
	data.LightDirection = lightDirection;
}


//////////////DistanceAttenuation/////////////

fragment DistanceAttenuation

inputs
{
	float LightDistance;
	float LightRadius;
}

outputs
{
	float LightIntensity;
}

fragmentCode void DistanceAttenuation(inout Data data)
{
	float lightScale =  saturate( ( data.LightRadius -  data.LightDistance ) / data.LightRadius );
	//d^2 attenutation
	data.LightIntensity = lightScale * lightScale;
}
