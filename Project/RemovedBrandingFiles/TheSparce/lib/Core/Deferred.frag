Pixel

//////////Store Geometry//////////////////////

fragment StoreGeometry

inputs
{
	float3 Normal;
	float3 PixelPosition;
	float FarDistance;
}

outputs
{
	float4 Color;
}

fragmentCode


void StoreGeometry(inout Data data)
{
	// get normal
	float3 normal = data.Normal;
	
	//Pixel position is in view space
	float3 viewPosition = data.PixelPosition;
	
	//Store linear depth
	//float depth = length(data.PixelPosition) / data.FarDistance;
	
	//Store z depth
	float depth = -data.PixelPosition.z / data.FarDistance;
     
	//Encode normal 0 to 1
	normal = (normal * 0.5) + 0.5;	
		
	//normal is in x,y,z and linear distance to the camera in in w
	data.Color = float4(normal, depth);		
}

//////////////////////ReadGeometry//////////////////////////

fragment ReadGeometry

inputs
{
	texture Geometry;
	float4 Screen;
	float3 PixelPosition;
	float FarDistance;
}

outputs
{
	float3 Normal;
	float3 PixelPosition;
}

fragmentCode

void ReadGeometry(inout Data data)
{
	float2 screenUv = ProjectedToUv(data.Screen);	
	float4 geoSample = tex2D(Geometry, screenUv);

	float normalizedDepth  = -geoSample.w;
  
  // NOTE: We have occasions where the value being read from the geo buffer is NOT normalized
  // Therefore, we normalize it here (this should be investigated in the future
  // It occurs on certain computers, such as Josh Fisher's DIT2200US machine inside of DorvisMod
	data.Normal = normalize(geoSample.xyz * 2 - 1);
		
	//Restore position using linear depth
	//float3 viewDirection = normalize(data.PixelPosition.xyz);
	//data.PixelPosition = normalizedDepth * viewDirection * data.FarDistance;
	
	//Restore position using z depth	
	float3 viewDirection = float3(data.PixelPosition.xy * (data.FarDistance / data.PixelPosition.z), data.FarDistance);
	data.PixelPosition = normalizedDepth * viewDirection;

}

/////////////////////StoreLighting///////////////////////////

fragment StoreLighting

inputs
{
	float4 Lighting;
	float Specular;
}

outputs
{
	float4 Color;
}

fragmentCode void StoreLighting(inout Data data)
{
	data.Color = float4(data.Lighting.xyz, data.Specular);
}


////////////////////ReadLighting//////////////////////

fragment ReadLighting

inputs
{
	float4 Screen;
	texture LightBuffer;
	float SpecularScalar;
}

outputs
{
	float4 Lighting;
	float4 LightColor;
	float Specular;
}

fragmentCode void ReadLighting(inout Data data)
{
	float2 screenUv = ProjectedToUv(data.Screen);	
	float4 lightSample = tex2D(LightBuffer, screenUv);
	data.Lighting = float4(lightSample.xyz, 1);
	data.LightColor = float4(lightSample.xyz, 1);
	data.Specular = lightSample.a;
}

////////////////////ReadLighting//////////////////////

fragment ReadLightingInferred

inputs
{
	float4 Screen;
	texture LightBuffer;
	texture Geometry;
	float3 PixelPosition;
	float3 Normal;
}

outputs
{
	float4 Lighting;
	float4 LightColor;
	float Specular;
}

fragmentCode void ReadLightingInferred(inout Data data)
{
	float2 samplePos = ProjectedToUv(data.Screen);
	
	float4 lightSample = tex2D(LightBuffer, samplePos);

	float cameraDistance = length(data.PixelPosition);

	//Compute this pixel positions
	float4 myGeo = float4( data.Normal, cameraDistance);

	float pixelX = 0.5 / 617;
	float pixelY = 0.5 / 620;

	//Get four samples to filter the result
	float2 sampleOffset[4];
	sampleOffset[0] = float2( pixelX,  pixelY);
	sampleOffset[1] = float2(-pixelX,  pixelY);
	sampleOffset[2] = float2(-pixelX, -pixelY);
	sampleOffset[3] = float2( pixelX, -pixelY);
	
	//Get four light samples
	float4 lightSamples[4];
	for(uint i=0;i<4;++i)
		lightSamples[i] = tex2D(LightBuffer, samplePos + sampleOffset[i]);

	//Get four geometry samples
	float4 geoSamples[4];
	for(uint i=0;i<4;++i)
		geoSamples[i] = tex2D(Geometry, samplePos + sampleOffset[i]);
		
	//Accumulate only valid samples
	float4 lightingResult = float4(0.0,0.0,0.0,0.0);
	float lights = 0.01;

	for(uint i=0;i<4;++i)
	{
		if( dot(geoSamples[i].xyz, data.Normal) - abs(geoSamples[i].w -cameraDistance) > 0.6 )
		{
			lightingResult += lightSamples[i];
			lights+=1.0;
		}
	}
	
	if(lights > 0 )
		lightingResult /= lights;
	else
		lightingResult = float4(0.0,0.0,0.0,0.0);
	
	data.Lighting = float4(lightingResult.xyz, 1);
	data.LightColor = float4(lightingResult.xyz, 1);
	data.Specular = lightingResult.a;
}

////////////////////DecalDepthKill//////////////////////

fragment DecalDepthKill

inputs
{
	texture Geometry;
	float4 Screen;
	float3 PixelPosition;
	float FarDistance;
}

outputs
{

}

fragmentCode void DecalDepthKill(inout Data data)
{
	float4 geoSample = tex2D(Geometry, (data.Screen.xy / data.Screen.ww) * 0.5 + 0.5);
	float3 viewDirection = float3(data.PixelPosition.xy * (data.FarDistance / data.PixelPosition.z), data.FarDistance);
	float normalizedDepth  = -geoSample.w;
	float3 sceenPosition = normalizedDepth * viewDirection;
	float diff = abs(sceenPosition.z - data.PixelPosition.z);
	if( diff > 0.1 )
		discard;
}
