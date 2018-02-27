// import _ from "lodash"
import * as Deeplearn from "deeplearn"
import Util from "./Util2.js"
import Model from "./Model.js"

export default class App{

    constructor() {
        this.canvas = document.createElement("canvas")

        this.weights = Deeplearn.variable( Deeplearn.randomNormal([ 100 * 100, 4], 0, 1 / Math.sqrt(100 * 100)));

        let labels = Deeplearn.Array2D.ones([100 * 100, 4])
        // console.log(labels.dataSync())
        Util.getImage("profile-22.jpg")
            .then(buffer => {

                var imageTensor = Deeplearn.Array2D.new([100 * 100, 4], Util.getImageNorm(buffer))

                this.train(labels, imageTensor)
                    .then(() => {

                        // this.test()

                    })
            })

    }

    // test() {

    //     Util.getImage("profile-22.jpg")
    //         .then(buffer => {
    //             const imageTensor = Deeplearn.Array2D.new([4, 100 * 100], Util.getImageNorm(buffer))
    //             const score = this.predict(imageTensor)
    //             console.log("true result: ", score)
    //         })

    //     Util.getImage("scarlett.jpg")
    //         .then(buffer => {
    //             const imageTensor = Deeplearn.Array2D.new([4, 100 * 100], Util.getImageNorm(buffer))
    //             const score = this.predict(imageTensor)
    //             console.log("false result: ", score)
    //         })
    // }

    async train(labels, imageTensor) {


        const TRAIN_STEPS = 100
        const LEARNING_RATE = 0.0001
        const optimizer = Deeplearn.train.sgd(LEARNING_RATE)

        for (let i = 0; i < TRAIN_STEPS; i++) {

            const cost = optimizer.minimize(() => {

                 return Deeplearn.losses.softmaxCrossEntropy(labels, Model.model(imageTensor)).mean()
            }, true);
            console.log("cost: " + cost.dataSync())



            await Deeplearn.nextFrame();

        }

        let reshaped = this.weights.reshape([
            100,
            100,
            4
        ])

        Util.renderToCanvas(reshaped, this.canvas, 6)

        // console.log(this.weights.dataSync())
    }

    predict(imageTensor) {

        const pred = Deeplearn.tidy(() => {
            const axis = 1;
            return imageTensor.matMul(this.weights).argMax(axis);
        });
        return Array.from(pred.dataSync());
    }

    getCanvas() {
        return this.canvas
    }

}
