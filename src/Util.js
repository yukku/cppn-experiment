import * as Deeplearn from 'deeplearn'

export default class Util{

    static createInput({ width, height, inputDimentionsNumber, hiddenVariablesNumber}) {

        const coords = new Float32Array(width * height * (inputDimentionsNumber + hiddenVariablesNumber));

        let pointer = 0;
        for (let d = 0; d < inputDimentionsNumber + hiddenVariablesNumber; d++) {
            for (let i = 0; i < width * height; i++) {
                const x = i % width
                const y = Math.floor(i / height)

                // console.log(x);
                // console.log(y);
                const coord = this.normalizeCoord(x, y, width, height, hiddenVariablesNumber)
                coords[pointer++] = coord[d]
            }
        }

        return Deeplearn.Array2D.new([inputDimentionsNumber + hiddenVariablesNumber, width * height], coords)
    }

    static normalizeCoord(x, y, width, height, hiddenVariablesNumber) {
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;
        const normX = (x - halfWidth) / width;
        const normY = (y - halfHeight) / height;

        const r = Math.sqrt(normX * normX + normY * normY);

        const result = [normX, normY, r];

        // Pad with zeros the number of latent terms, these get added on the GPU as
        // uniforms.
        for (let i = 0; i < hiddenVariablesNumber; i++) {
          result.push(0);
        }
        return result;
    }

    static addLatentVariables( gpgpu, addZShader, sourceTex, resultTex, shapeRowCol, z1, z2) {

        gpgpu.setOutputMatrixTexture(resultTex, shapeRowCol[0], shapeRowCol[1]);
        gpgpu.setProgram(addZShader);

        const sourceSamplerLocation = Deeplearn.webgl_util.getProgramUniformLocationOrThrow(gpgpu.gl, addZShader, 'source');
        gpgpu.setInputMatrixTexture(sourceTex, sourceSamplerLocation, 0);

        const zLoc = gpgpu.getUniformLocation(addZShader, 'z');
        gpgpu.gl.uniform2f(zLoc, z1, z2);
        gpgpu.executeProgram();
    }

    static getAddLatentVariablesShader(gpgpu, inputNumDimensions) {
        const fragmentShaderSource = `
            precision highp float;
            uniform sampler2D source;
            varying vec2 resultUV;

            uniform vec2 z;

            const vec2 halfCR = vec2(0.5, 0.5);

            void main() {
              vec2 outputCR = floor(gl_FragCoord.xy);
              if (outputCR[1] == ${inputNumDimensions}.0) {
                gl_FragColor = vec4(z[0], 0, 0, 0);
              } else if (outputCR[1] > ${inputNumDimensions}.0) {
                gl_FragColor = vec4(z[1], 0, 0, 0);
              } else {
                gl_FragColor = texture2D(source, resultUV);
              }
            }`;
        return gpgpu.createProgram(fragmentShaderSource);
    }

    static getRenderShader(gpgpu, imageSize) {
      const fragmentShaderSource = `
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
        }`;

      return gpgpu.createProgram(fragmentShaderSource);
    }

    static render(gpgpu, renderShader, sourceTex, outputNumDimensions, colorMode) {
        Deeplearn.webgl_util.bindCanvasToFramebuffer(gpgpu.gl);
        gpgpu.setProgram(renderShader);

        const sourceSamplerLocation = Deeplearn.webgl_util.getProgramUniformLocationOrThrow(gpgpu.gl, renderShader, 'source');
        gpgpu.setInputMatrixTexture(sourceTex, sourceSamplerLocation, 0);
        const colorModeLoc = gpgpu.getUniformLocation(renderShader, 'colorMode');
        gpgpu.gl.uniform1i(colorModeLoc, colorMode);
        const outputNumDimensionsLoc = gpgpu.getUniformLocation(renderShader, 'outputNumDimensions');
        gpgpu.gl.uniform1f(outputNumDimensionsLoc, outputNumDimensions);
        gpgpu.executeProgram();
    }


    static renderToCanvas(array, canvas) {
        return new Promise((resolve, reject) => {

            const ctx = canvas.getContext('2d')
            const [height, width, depth] = array.shape
            const imageData = new ImageData(width, height)

            array.data()
                .then(data => {

                    for (let i = 0; i < width * height; i++) {
                        const j = i * 4
                        const k = i * 3
                        imageData.data[j + 0] = Math.round(255 * data[k + 0])
                        imageData.data[j + 1] = Math.round(255 * data[k + 1])
                        imageData.data[j + 2] = Math.round(255 * data[k + 2])
                        imageData.data[j + 3] = 255
                    }

                    // for (let d = 0; d < depth; d++) {
                    //     for (let i = 0; i < width * height; i++) {
                    //         imageData.data[j + 0] = Math.round(255 * data[k + 0])
                    //         imageData.data[j + 1] = Math.round(255 * data[k + 1])
                    //         imageData.data[j + 2] = Math.round(255 * data[k + 2])
                    //         imageData.data[j + 3] = 255

                    //     }
                    // }


                    ctx.putImageData(imageData, 0, 0)
                    resolve()
                })
        })

    }
}
