/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {
    "mouseY": { value: 0.0 },
    "mouseX": { value: 0.0 },
    "frames": { value: 0.0 },
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
    "uniform float mouseY;",
    "uniform float mouseX;",
    "uniform float frames;",
    "const float PI = 3.1415926535;",
    "varying vec2 vUv;",

    "float distance(float x1, float y1, float x2, float y2) {",
      "return sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));",
    "}",
    
    "void main() {",
      "vec2 q = vUv;",
      "vec2 uv;",
      "float x = mouseX;",
      "float y = mouseY;",
      "float angle = atan(q.x * 100.0 - x, q.y * 100.0 -  y) * 2.0;",
      "float baseDiff = distance(x, y, q.x, q.y);",
      "float dist = 50.0 / baseDiff;",
      "uv.x = (q.x);",
      "uv.y = (q.y);",

      "vec4 color = texture2D( text0, uv);",
      "gl_FragColor = vec4(",
        "color.r + dist,",
        "color.g,",
        "color.b,",
        "color.a",
      ");",
    "}"

  ].join( "\n" )

};
