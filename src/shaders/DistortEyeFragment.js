/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {
    "scale": { value: 120.0 },
    "ratio": { value: 1.0 },
    "frames": { value: 120.0 },
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
    "uniform float scale;",
    "uniform float ratio;",
    "uniform float frames;",
    "const float PI = 3.1415926535;",
    "uniform vec2 center;",
    "varying vec2 vUv;",

    "void main() {",
      "float aperture = 220.0;",
      "float apertureHalf = 0.5 * aperture * (PI / 180.0);",
      "float maxFactor = sin(apertureHalf);",
      "vec2 q = vUv;",
      "vec2 uv;",
      "vec2 xy = 2.0 * q.xy - 1.0;",
      "float d = length(xy);",
      "d = length(xy * maxFactor);",
      "float inter = 98.0;",
      "float amp = scale;",
      "float denX = sin(inter * atan(xy.x, q.x) * PI / 180.0);",
      "float denY = cos(inter * atan(xy.y, q.y) * PI / 180.0);",
      "float z = sqrt(1.0 - d * d);",
      "float r = atan(d, z) / PI;",
      "float phi = atan(denY, denX);",
      "uv.x = (r * cos(phi) + 0.5);",
      "uv.y = (r * sin(phi) + 0.5);",
      "vec4 color = texture2D( text0, uv);",

      "float average = ( color.r + color.g + color.b ) / 3.0;",

      "gl_FragColor = vec4(",
        "color.r + sin((color.r * 10.0 - 5.0 * frames + PI / 180.0)),",
        "color.g + sin((color.g * 9.0 - 4.0 * frames + PI / 180.0)), ",
        "color.b + sin((color.b * 8.0 - 3.0 * frames + PI / 180.0)),",
        // "vec3(1.0 * sin(average * 8.0 - 4.0 * PI / 180.0)),",
        // "average,average,average,",
        // "color.r,",
        // "color.g,",
        // "color.b,",
        "color.a",
      ");",
    "}"

  ].join( "\n" )

};
