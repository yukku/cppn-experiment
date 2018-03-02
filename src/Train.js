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

        // this.weights = Deeplearn.variable( Deeplearn.randomNormal([ 100 * 100, 4], 0, 1 / Math.sqrt(100 * 100)));


        // console.log(labels.dataSync())
        // Util.getImage("profile-22.jpg")
        Util.getImage("scarlett2.jpg")
            .then(imageData => {


                const labels = Deeplearn.Array4D.ones([1, 1, 1, 1])
                const imageTensor = Deeplearn.fromPixels(imageData)

                // const labels = Deeplearn.Array3D.ones([this.imageHeight, this.imageWidth, 4])
                // const imageTensor = Deeplearn.Array3D.new([this.imageHeight, this.imageWidth, 4], Util.getImageNorm(buffer, this.imageWidth, this.imageHeight))

                this.train(labels, imageTensor)
                    .then(() => {


                        // const app = new App(this.canvas)
                        // this.test()

                    })
            })

    }



    async train(labels, imageTensor) {

        const TRAIN_STEPS = 100
        const LEARNING_RATE = 0.00001
        // const optimizer = Deeplearn.train.sgd(LEARNING_RATE)
        // const optimizer = Deeplearn.train.momentum(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adadelta(LEARNING_RATE)
        const optimizer = Deeplearn.train.adam(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adamax(LEARNING_RATE) //
        // const optimizer = Deeplearn.train.rmsprop(LEARNING_RATE)
        // const optimizer = Deeplearn.train.adagrad(LEARNING_RATE)

        for (let i = 0; i < TRAIN_STEPS; i++) {

            const cost = optimizer.minimize(() => {
                 return Deeplearn.losses.softmaxCrossEntropy(labels, Model.model(imageTensor)).mean()
            }, true);
            console.log("cost: " + cost.dataSync())
            // await Deeplearn.nextFrame();

        }


    }

    predict(imageTensor) {

        const pred = Deeplearn.tidy(() => {
            const axis = 1;
            return Model.model(imageTensor).argMax(axis);
        })

        return pred;
    }

    test() {

        Util.getImage("scarlett2.jpg")
            .then(buffer => {
                const imageTensor = Deeplearn.Array2D.new([this.imageWidth * this.imageHeight, 4], Util.getImageNorm(buffer, this.imageWidth, this.imageHeight))
                const score = this.predict(imageTensor)
                // console.log("true result: ", Array.from(score.dataSync()))

                // let reshaped = score.reshape([
                //     this.imageWidth,
                //     this.imageHeight,
                //     1
                // ])
                console.log(score.dataSync())
                // Util.renderToCanvas(reshaped, this.canvas, 3)


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
