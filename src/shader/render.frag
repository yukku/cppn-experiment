precision highp float;
uniform sampler2D source;
varying vec2 resultUV;

uniform int colorMode;
uniform float outputNumDimensions;

const float destinationSize = ${imageSize}.0;

const mat3 yuv2rgb = mat3(
      1,       1,     1,
      0, -.34413, 1.772,
  1.402, -.71414,     0);

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 outputCR = floor(gl_FragCoord.xy);
  float inputC = outputCR.y * destinationSize + outputCR.x;
  float u = (inputC + 0.5) / ${imageSize * imageSize}.0;

  vec4 inputR = vec4(0.0, 1.0, 2.0, 3.0);
  vec4 v = (inputR + 0.5) / outputNumDimensions;

  vec4 values = vec4(
    texture2D(source, vec2(u, v[0])).r,
    texture2D(source, vec2(u, v[1])).r,
    texture2D(source, vec2(u, v[2])).r,
    texture2D(source, vec2(u, v[3])).r);

  if (colorMode == 0) {
    // RGB
    gl_FragColor = vec4(values.rgb, 1.0);
  } else if (colorMode == 1) {
    // RGBA
    gl_FragColor = values;
  } else if (colorMode == 2) {
    // HSV
    vec3 rgb = hsv2rgb(values.rgb);
    gl_FragColor = vec4(rgb, 1.0);
  } else if (colorMode == 3) {
    // HSVA
    vec3 rgb = hsv2rgb(values.rgb);
    gl_FragColor = vec4(rgb, values[3]);
  } else if (colorMode == 4 || colorMode == 5) {
    // YUV
    values[0] = clamp(values[0], 0.2, 0.8);
    values[1] = values[1] - 0.5;
    values[2] = values[2] - 0.5;
    vec3 rgb = yuv2rgb * values.rgb;
    if (colorMode == 4) {
      // YUV
      gl_FragColor = vec4(rgb, 1.0);
    } else if (colorMode == 5) {
      // YUVA
      gl_FragColor = vec4(rgb, values.a);
    }
  } else if (colorMode == 6) {
    gl_FragColor = vec4(values[0], values[0], values[0], 1.0);
  }
}
