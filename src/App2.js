// import _ from "lodash"
import * as Deeplearn from "deeplearn"
import Util from "./Util2.js"

export default class App{

    constructor() {

        this.INPUT_DIMENSIONS_NUMBER = 3  // x, y, r
        this.HIDDEN_VARIABLES_NUMBER = 6 // w
        this.MAT_WIDTH = 20
        const WEIGHTS_STDEV = 0.34
        this.MAX_LAYERS = 50

        this.canvas = document.createElement("canvas")

        const canvasSize = 100
        this.canvas.width = canvasSize
        this.canvas.height = canvasSize
        // this.canvas.style.width = canvasSize*4 + "px"
        // this.canvas.style.height = canvasSize*4  + "px"
        // this.canvas.style.width = 100 + "%"
        // this.canvas.style.height = 100  + "%"


        this.buffer = null
        this.buffer2 = null

        this.prevOutput;


        this.input = Util.createInput({
            buffer: this.buffer,
            width: this.canvas.width,
            height: this.canvas.height,
            inputDimensionsNumber: this.INPUT_DIMENSIONS_NUMBER
        })



        this.weights = [];

        this.weights.push(Deeplearn.truncatedNormal(
            [this.MAT_WIDTH, this.INPUT_DIMENSIONS_NUMBER + this.HIDDEN_VARIABLES_NUMBER], 0, WEIGHTS_STDEV));
        for (let i = 0; i < this.MAX_LAYERS; i++) {
          this.weights.push(Deeplearn.truncatedNormal(
              [this.MAT_WIDTH, this.MAT_WIDTH], 0, WEIGHTS_STDEV));
        }

        this.weights.push(Deeplearn.Array2D.randTruncatedNormal(
            [ 4, this.MAT_WIDTH], 0, WEIGHTS_STDEV));


        this.z1Counter = 0
        this.z2Counter = 0

        Util.getImage("profile-22.jpg")
            .then(buffer => {
                this.getOutput(Util.getImageNorm(buffer))
            })

    }




    getOutput(prevOutput) {
        // console.log(prevOutput)
        // var prevTensor = Deeplearn.Array2D.new([4, this.canvas.width * this.canvas.height], prevOutput)

        // let reshaped = prevTensor.reshape([
        //     this.canvas.height,
        //     this.canvas.width,
        //     4
        // ])

        // Util.renderToCanvas(reshaped, this.canvas, 5)

        this.z1Counter += 0.01
        this.z2Counter += 0.02

        const lastOutput = Deeplearn.tidy(() => {

            var z1 = Deeplearn.Scalar.new(Math.sin(this.z1Counter));
            var z2 = Deeplearn.Scalar.new(Math.cos(this.z2Counter));

            this.ones = Deeplearn.Array2D.ones([1, this.input.shape[1]]);


            var z1Mat = z1.mul(this.ones);
            var z2Mat = z2.mul(this.ones);
            var concatAxis = 1;
            var latentVars = z1Mat.concat(z2Mat);
            var prevTensor = Deeplearn.Array2D.new([4, this.canvas.width * this.canvas.height], prevOutput)
            prevTensor = prevTensor.concat(latentVars)




            var lastOutput = this.input.concat(prevTensor);
            console.log(lastOutput)
            console.log(this.weights[0])
             for (var i = 0; i < this.weights.length; i++) {

                const matmulResult = this.weights[i].matMul(lastOutput);

                console.log(matmulResult)

                if(i === this.weights.length - 1) {

                    lastOutput = matmulResult.sigmoid()


                }else if(i%2){
                    // lastOutput = matmulResult.relu()
                    lastOutput = matmulResult.tanh()
                }else{
                    lastOutput = matmulResult.tanh()
                }
            }


            return lastOutput


        });

        let reshaped = lastOutput.reshape([
            this.canvas.height ,
            this.canvas.width  ,
            4
        ])

        Util.renderToCanvas(reshaped, this.canvas, 2)
            .then((imageData) => {
                const normImageData = Util.getImageNorm(imageData.data)
                setTimeout(() => {
                    // requestAnimationFrame(() => this.getOutput(normImageData));
                }, 20);
            })

    }


    getCanvas() {
        return this.canvas
    }

    getCanvas2() {
        return this.canvas2
    }

}
