// import _ from "lodash"
import * as Deeplearn from "deeplearn"
import Util from "./Util2.js"
import Model from "./Model.js"
import App from "./App2.js"

export default class Train{

    constructor() {
        this.imageWidth = 28
        this.imageHeight = 28

        this.canvas = document.createElement("canvas")
        this.canvas2 = document.createElement("canvas")

        Util.getImage("scarlett2.jpg")
            .then(imageData => {

                const labels = Util.createInput({
                    width: 28,
                    height: 28,
                    inputDimensionsNumber: 3
                })

                // let reshaped = labels.reshape([
                //                     28,
                //                     28,
                //                     3,
                //                 ])

                // Util.renderAllToCanvas(reshaped, this.canvas, 3)


                const imageTensor = Deeplearn.fromPixels(imageData)
                var lastOutput = imageTensor
                    .toFloat()
                    // .transpose()
                    .reshape([28*28, 3])
                    .div(Deeplearn.scalar(255))

                // Util.renderAllToCanvas(lastOutput, this.canvas, 3)


                // console.log(lastOutput.dataSync())
                this.train(labels, lastOutput)
                    .then(() => {


                        const app = new App(this.canvas)
                        // this.test()

                    })
            })

    }



    async train(labels, imageTensor) {

        const TRAIN_STEPS = 10
        const LEARNING_RATE = 0.01
        const optimizer = Deeplearn.train.sgd(LEARNING_RATE)
        // const optimizer = Deeplearn.train.momentum(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adadelta(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adam(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adamax(LEARNING_RATE) //
        // const optimizer = Deeplearn.train.rmsprop(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adagrad(LEARNING_RATE)

        for (let i = 0; i < TRAIN_STEPS; i++) {

            const cost = optimizer.minimize(() => {
                 return Deeplearn.losses.softmaxCrossEntropy(imageTensor, Model.model(labels)).mean()
            }, true);

            if(i%10 == 0){
                console.log("steps: " + i, "cost: " + cost.dataSync())
            }
            await Deeplearn.nextFrame();

        }


    }

    predict(labels) {

        const pred = Deeplearn.tidy(() => {
            const axis = 1;
            return Model.model(labels).argMax(axis);
        })

        return pred;
    }

    test() {



        Util.getImage("scarlett2.jpg")
            .then(imageData => {
                const imageTensor = Deeplearn.fromPixels(imageData)
                var lastOutput = imageTensor
                    .toFloat()
                    .div(Deeplearn.scalar(255))
                    .reshape([28*28, 3])
                const score = this.predict(lastOutput)
                console.log("true result: ", Array.from(score.dataSync()))

                let reshaped = score.reshape([
                    this.imageWidth,
                    this.imageHeight,
                    1
                ])
                Util.renderToCanvas(reshaped, this.canvas, 3)


            })

        // Util.getImage("scarlett.jpg")
        //     .then(buffer => {
        //         const imageTensor = Deeplearn.Array2D.new([100 * 100, 4], Util.getImageNorm(buffer))
        //         const score = this.predict(imageTensor)
        //         console.log("false result: ", Array.from(score.dataSync()))

        //         // let reshaped = score.reshape([
        //         //     100,
        //         //     100,
        //         //     1
        //         // ])

        //         // Util.renderToCanvas(reshaped, this.canvas2, 3)
        //     })
    }

    getCanvas() {
        return this.canvas
    }
    getCanvas2() {
        return this.canvas2
    }
}
