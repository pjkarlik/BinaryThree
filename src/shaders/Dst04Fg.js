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
    "varying vec2 vUv;",

    "float distance(float a, float b, float c, float d) {",
      "return sqrt(((a - c) * (a - c) + (b - d) * (b - d)));",
    "}",
    
    "void main() {",
      "vec2 q = vUv;",
      "vec2 uv;",

      "float val = ( sin( distance(q.x, q.y, 0.5, 0.5) / 0.5 ) ) * 0.8;",
        // "+ sin(distance(q.x, q.y, 64.0, 64.0) / 8.0)",
        // "+ sin(distance(q.x, q.y + frames / 7.0, 192.0, 64.0) / 7.0)",
        // "+ sin(distance(q.x, q.y, 192.0, 100.0) / 8) * 0.1;",

        "uv.x = (q.x) + val;",
        "uv.y = (q.y) + val;",

      "vec4 color = texture2D( text0, uv);",
      // "float average = ( color.r + color.g + color.b ) / 3.0;",
      "gl_FragColor = vec4(",
        // "color.r + sin((color.r * 10.0 - 5.0 * frames + PI / 180.0)) * 0.1,",
        // "color.g + sin((color.g * 9.0 - 4.0 * frames + PI / 180.0)) * 0.1, ",
        // "color.b + sin((color.b * 8.0 - 3.0 * frames + PI / 180.0)) * 0.1,",
        // "vec3(1.0 * sin(average * 8.0 - 4.0 * PI / 180.0)),",
        // "average,average,average,",
        "color.r,",
        "color.g,",
        "color.b,",
        "color.a",
      ");",
    "}"

  ].join( "\n" )

};
