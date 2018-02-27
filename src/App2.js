// import _ from "lodash"
import * as Deeplearn from "deeplearn"
import Util from "./Util2.js"
import Model from "./Model.js"

export default class App{

    constructor(canvas) {

        this.INPUT_DIMENSIONS_NUMBER = 2  // x, y, r


        this.canvas = canvas || document.createElement("canvas")

        const canvasSize = 400
        this.canvas.width = canvasSize
        this.canvas.height = canvasSize
        // this.canvas.style.width = canvasSize*4 + "px"
        // this.canvas.style.height = canvasSize*4  + "px"
        // this.canvas.style.width = 100 + "%"
        // this.canvas.style.height = 100  + "%"
        this.weights = Model.getWeight()

        this.buffer = null
        this.buffer2 = null

        this.prevOutput;


        this.input = Util.createInput({
            buffer: this.buffer,
            width: this.canvas.width,
            height: this.canvas.height,
            inputDimensionsNumber: this.INPUT_DIMENSIONS_NUMBER
        })

        this.z1Counter = 0
        this.z2Counter = 0


        this.getOutput()

    }




    getOutput() {


        // this.z1Counter += 0.01
        // this.z2Counter += 0.01

        const lastOutput = Deeplearn.tidy(() => {

            var z1 = Deeplearn.Scalar.new(Math.sin(this.z1Counter));
            var z2 = Deeplearn.Scalar.new(Math.cos(this.z2Counter));

            this.ones = Deeplearn.Array2D.ones([this.input.shape[0], 1]);


            var z1Mat = z1.mul(this.ones);
            var z2Mat = z2.mul(this.ones);
            var concatAxis = 1;
            var latentVars = z1Mat.concat(z2Mat, 1);

            var prevTensor
            // if(prevOutput){
            //     prevTensor = Deeplearn.Array2D.new([this.canvas.width * this.canvas.height, 4], prevOutput)
            // }else{
            //     prevTensor = this.input.concat(latentVars, 1);
            // }
            prevTensor = this.input.concat(latentVars, 1);

            var lastOutput = prevTensor

             for (var i = 0; i < this.weights.length; i++) {

                const matmulResult = lastOutput.matMul(this.weights[i]);
                // console.log(matmulResult)
                if(i === this.weights.length - 1) {
                    lastOutput = matmulResult.sigmoid()
                }else if(i%2){
                    // lastOutput = matmulResult.relu()
                    lastOutput = matmulResult.relu()
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

        Util.renderToCanvas(reshaped, this.canvas, 1)
            .then((imageData) => {

                // const normImageData = Util.getImageNorm(imageData.data, 100, 100)
                setTimeout(() => {
                    //requestAnimationFrame(() => this.getOutput(normImageData));

                    // requestAnimationFrame(() => this.getOutput());
                }, 40);
            })

    }


    getCanvas() {
        return this.canvas
    }

    getCanvas2() {
        return this.canvas2
    }

}
