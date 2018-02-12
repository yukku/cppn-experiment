// import _ from "lodash"
import * as Deeplearn from "deeplearn"
import Util from "./Util.js"

export default class App{

    constructor() {

        const INPUT_DIMENTIONS_NUMBER = 3  // x, y, r
        const HIDDEN_VARIABLES_NUMBER = 3 // r, g, b
        const MAT_WIDTH = 100
        const WEIGHTS_STDEV = 0.6
        this.MAX_LAYERS = 10

        this.canvas = document.createElement("canvas")
        this.canvas2 = document.createElement("canvas")

        const gl = Deeplearn.gpgpu_util.createWebGLContext(this.canvas)
        const maxTextureSize = Deeplearn.webgl_util.queryMaxTextureSize(gl)
        // const canvasSize = Math.floor(Math.sqrt(maxTextureSize))
        // const canvasSize = 10
        const canvasSize = 100
        this.canvas.width = canvasSize
        this.canvas.height = canvasSize
        this.canvas.style.width = canvasSize*4 + "px"
        this.canvas.style.height = canvasSize*4  + "px"


        this.gpgpu = new Deeplearn.GPGPUContext(gl)
        this.backend = new Deeplearn.MathBackendWebGL(this.gpgpu)
        this.math = new Deeplearn.NDArrayMath(this.backend, false)
        Deeplearn.ENV.setMath(this.math);

        Util.getImage("profile-22.jpg")
            .then(buffer => {

                this.input = Util.createInput({
                    buffer: buffer,
                    width: this.canvas.width,
                    height: this.canvas.height,
                    inputDimentionsNumber: INPUT_DIMENTIONS_NUMBER,
                    hiddenVariablesNumber: HIDDEN_VARIABLES_NUMBER
                })

                // this.ones = Deeplearn.Array2D.ones(this.input.shape);

                this.renderShader = Util.getRenderShader(this.gpgpu, canvasSize);

                this.addLatentVariablesShader = Util.getAddLatentVariablesShader(this.gpgpu, INPUT_DIMENTIONS_NUMBER);


                this.weights = [];

                this.weights.push(Deeplearn.Array2D.randTruncatedNormal(
                    [MAT_WIDTH, INPUT_DIMENTIONS_NUMBER + HIDDEN_VARIABLES_NUMBER], 0,
                    WEIGHTS_STDEV));
                for (let i = 0; i < this.MAX_LAYERS; i++) {
                  this.weights.push(Deeplearn.Array2D.randTruncatedNormal(
                      [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV));
                }
                this.weights.push(Deeplearn.Array2D.randTruncatedNormal(
                    [4 /** max output channels */, MAT_WIDTH], 0, WEIGHTS_STDEV));
                // console.log(this.weights);


                const reshaped = this.input.reshape([
                            this.canvas.height,
                            this.canvas.width,
                            INPUT_DIMENTIONS_NUMBER + HIDDEN_VARIABLES_NUMBER,
                        ])
                // console.log(reshaped.dataSync());

                Util.renderToCanvas(reshaped, this.canvas2)

                this.z1Counter = 0
                this.z2Counter = 0

                // // this.update()
                this.getOutput()

            })

    }

    getOutput() {

        this.z1Counter += 0.01
        this.z2Counter += 0.01

        const z1 = Math.sin(this.z1Counter)
        const z2 = Math.cos(this.z2Counter)
        const inputWithLatentVariables = Deeplearn.NDArray.make(this.input.shape, {})

        Util.addLatentVariables(
            this.gpgpu,
            this.addLatentVariablesShader,
            this.backend.getTexture(this.input.dataId),
            this.backend.getTexture(inputWithLatentVariables.dataId),
            this.input.shape,
            z1,
            z2
        )

        let lastOutput = inputWithLatentVariables;

        this.math.scope(() => {


            for (let i = 0; i < this.MAX_LAYERS; i++) {


                const matmulResult = this.math.matMul(this.weights[i], lastOutput);
                lastOutput = (i === this.MAX_LAYERS - 1) ?
                this.math.sigmoid(matmulResult) :
                this.math.tanh(matmulResult)
            }

            Util.render(
                this.gpgpu,
                this.renderShader,
                this.backend.getTexture(lastOutput.dataId),
                3,
                0
            )
        });

        inputWithLatentVariables.dispose();
        // requestAnimationFrame(() => this.getOutput());

    }


    getCanvas() {
        return this.canvas
    }

    getCanvas2() {
        return this.canvas2
    }

}
