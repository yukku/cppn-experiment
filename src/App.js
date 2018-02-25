// import _ from "lodash"
import * as Deeplearn from "deeplearn"
import Util from "./Util.js"

export default class App{

    constructor() {

        const INPUT_DIMENTIONS_NUMBER = 3  // x, y, r
        const HIDDEN_VARIABLES_NUMBER = 2 // w
        this.MAT_WIDTH = 50
        const WEIGHTS_STDEV = 0.28
        this.MAX_LAYERS = 20

        this.canvas = document.createElement("canvas")
        this.canvas2 = document.createElement("canvas")

        const gl = Deeplearn.gpgpu_util.createWebGLContext(this.canvas)
        const maxTextureSize = Deeplearn.webgl_util.queryMaxTextureSize(gl)
        // const canvasSize = Math.floor(Math.sqrt(maxTextureSize))
        // const canvasSize = 10
        const canvasSize = 100
        this.canvas.width = canvasSize
        this.canvas.height = canvasSize
        // this.canvas.style.width = canvasSize*4 + "px"
        // this.canvas.style.height = canvasSize*4  + "px"
        this.canvas.style.width = 100 + "%"
        this.canvas.style.height = 100  + "%"

        this.gpgpu = new Deeplearn.GPGPUContext(gl)
        this.backend = new Deeplearn.MathBackendWebGL(this.gpgpu)
        this.math = new Deeplearn.NDArrayMath(this.backend, false)
        Deeplearn.ENV.setMath(this.math);

        this.buffer = null
        this.buffer2 = null
        Util.getImage("profile-22.jpg")
            .then(buffer => {
                this.buffer = buffer
                return Util.getImage("scarlett.jpg")
            })
            .then(buffer2 => {
                this.buffer2 = buffer2


                this.input = Util.createInput({
                    buffer: this.buffer,
                    buffer2: this.buffer2,
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
                    [this.MAT_WIDTH, INPUT_DIMENTIONS_NUMBER + HIDDEN_VARIABLES_NUMBER], 0,
                    WEIGHTS_STDEV));
                for (let i = 0; i < this.MAX_LAYERS; i++) {
                  this.weights.push(Deeplearn.Array2D.randTruncatedNormal(
                      [this.MAT_WIDTH, this.MAT_WIDTH], 0, WEIGHTS_STDEV));
                }

                // console.log(this.weights[1].shape);

                this.weights.push(Deeplearn.Array2D.randTruncatedNormal(
                    [3 /** max output channels */, this.MAT_WIDTH], 0, WEIGHTS_STDEV));
                // console.log(this.weights);


                const reshaped = this.input.reshape([
                            this.canvas.height,
                            this.canvas.width,
                            INPUT_DIMENTIONS_NUMBER + HIDDEN_VARIABLES_NUMBER,
                        ])
                // console.log(reshaped.dataSync());

                // Util.renderToCanvas(reshaped, this.canvas2)

                this.z1Counter = 0
                this.z2Counter = 0

                // // this.update()
                this.getOutput()
                // this.setupSession()
            })

    }

    // createFullyConnectedLayer( graph, inputLayer, layerIndex, units, activationFunction ) {
    //     return graph.layers.dense('fully_connected_' + layerIndex, inputLayer, units, activationFunction ? activationFunction : (x) => graph.relu(x) );
    //   }

    // setupSession() {
    //     const graph = new Deeplearn.Graph()

    //     const initialLearningRate = 0.06

    //     this.optimizer = new SGDOptimizer(initialLearningRate)

    //     this.inputTensor = graph.placeholder('input RGB value', [3])
    //     this.targetTensor = graph.placeholder('output classifier', [2])

    //     let connectedLayer = this.createConnectedLayer(graph, this.inputTensor, 0, 64)
    //     connectedLayer = this.createConnectedLayer(graph, connectedLayer, 1, 32)
    //     connectedLayer = this.createConnectedLayer(graph, connectedLayer, 2, 16)

    //     this.predictionTensor = this.createConnectedLayer(graph, connectedLayer, 3, 2)
    //     this.costTensor = graph.meanSquaredCost(this.targetTensor, this.predictionTensor)

    //     this.session = new Session(graph, math)

    //  }


    getOutput(prevOutput) {

        this.z1Counter += 0.007
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
        // console.log(lastOutput);
        // console.log(this.math);
        //
        console.log(inputWithLatentVariables)
        console.log(this.weights[0])
        this.math.scope(() => {
        // console.log(Deeplearn);
        // Deeplearn.tidy(keep => {

            for (let i = 0; i < this.MAX_LAYERS; i++) {


                const matmulResult = this.math.matMul(this.weights[i], lastOutput);
                // console.log(matmulResult)
                // Util.renderToCanvas(matmulResult.reshape([
                //             this.canvas.height,
                //             this.canvas.width,
                //             this.MAT_WIDTH,
                //         ]), this.canvas2, 1)

                // console.log(matmulResult.dataSync());

                if(i === this.MAX_LAYERS - 1) {
                    lastOutput = this.math.sigmoid(matmulResult)
                }else if(i%2){
                    lastOutput = this.math.relu(matmulResult)
                }else{
                    lastOutput = this.math.tanh(matmulResult)
                }
                // lastOutput = (i === this.MAX_LAYERS - 1) ?
                // this.math.sigmoid(matmulResult) :
                // // this.math.relu(matmulResult) :
                // // this.math.selu(matmulResult) :
                // this.math.tanh(matmulResult)
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
        requestAnimationFrame(() => this.getOutput(lastOutput));

    }


    getCanvas() {
        return this.canvas
    }

    getCanvas2() {
        return this.canvas2
    }

}
