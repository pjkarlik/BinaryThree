/* eslint-disable */
THREE.RenderFragment = {
  	uniforms: {
      "tDiffuse": { value: null }
  	},

  	vertexShader: [
  		"varying vec2 vUv;",
  		"void main() {",
  			"vUv = uv;",
  			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  		"}"
  	].join( "\n" ),

  	fragmentShader: [
      "uniform sampler2D text0;",
      "const float PI = 3.1415926535;",
  		"uniform vec2 center;",
  		"varying vec2 vUv;",

  		"void main() {",
        "float aperture = 190.0;",
        "float apertureHalf = 0.5 * aperture * (PI / 180.0);",
        "float maxFactor = sin(apertureHalf);",
				"vec2 q = vUv;",
        "vec2 uv;",
        "vec2 xy = 2.0 * q.xy - 1.0;",
        "float d = length(xy);",
        "d = length(xy * maxFactor);",
        "float z = sqrt(1.0 - d * d);",
        "float r = atan(d, z) / PI;",
        "float phi = atan(xy.y, xy.x);",

        "uv.x = r * cos(phi) + 0.5;",
        "uv.y = r * sin(phi) + 0.5;",
				"vec4 color = texture2D( text0, uv);",
				
        "float Dist = sqrt((q.x - 0.5) * (q.x - 0.5) + (q.y - 0.5) * (q.y - 0.5));",
				"float average = ( color.r + color.g + color.b ) / 3.0;",

  			"gl_FragColor = vec4(",
        // "average,average,average,",
          "color.r,",
          "color.g,",
          "color.b,",
					// "sin(color.r * 10.0 - 5.0) / Dist,",
					// "sin(color.g * 10.0 - 5.0) / Dist, ",
					// "sin(color.b * 10.0 - 5.0) / Dist,",
					"color.a",
				");",
  		"}"

  	].join( "\n" )

  };
