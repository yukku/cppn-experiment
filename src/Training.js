import * as dl from "deeplearn"
import Util from "./Util.js"
import Model from "./Model.js"

export default class Training{

    constructor({ canvas }) {

        this.TRAIN_STEPS = 10000
        this.LEARNING_RATE = 0.001
        // this.LEARNING_RATE = 0.01

        this.canvas = canvas

        this.start()
    }

    start() {
        this.load()
            .then(([trainingTensor, coordTensor, height, width]) => {
                return this.train(coordTensor, trainingTensor, height, width)
            })
            .then(() => {

            })
    }

    async load() {
        // const imageData = await Util.getImage("scarlett2.jpg")
        // const imageData = await Util.getImage("profile-22.jpg")
        const imageData = await Util.getImage("scarlett.jpg")
        const height = imageData.height
        const width = imageData.width
        const trainingTensor = dl.fromPixels(imageData)
                            .toFloat()
                            .div(dl.scalar(255))
                            .reshape([height*width, 3])

        const coordTensor = Util.createCoordTensor(height, width, 3)

        return [trainingTensor, coordTensor, height, width]
    }

    async train(labelTensor, trainingTensor, height, width) {

        // const optimizer = dl.train.sgd(this.LEARNING_RATE)
        // const optimizer = dl.train.momentum(this.LEARNING_RATE)
        // const optimizer = dl.train.adadelta(this.LEARNING_RATE)
        const optimizer = dl.train.adam(this.LEARNING_RATE)
        // const optimizer = dl.train.adamax(this.LEARNING_RATE)
        // const optimizer = dl.train.rmsprop(this.LEARNING_RATE)
        // const optimizer = dl.train.adagrad(this.LEARNING_RATE)

        let result

        for (let i = 0; i < this.TRAIN_STEPS; i++) {

            const cost = optimizer.minimize(() => {
                const resultTensor = Model.model(labelTensor)
                result = resultTensor.dataSync()
                return dl.losses.softmaxCrossEntropy(trainingTensor, resultTensor).mean()
            }, true);


            const tensor = dl.Array2D.new([height * width, 3], result)
                .concat(dl.Array2D.ones([height * width, 1]), 1)
                .reshape([ height, width, 4 ])

            Util.renderToCanvas(tensor, this.canvas, 4)

            if(i%10 == 0){
                console.log("steps: " + i, "cost: " + cost.dataSync())
            }

            await dl.nextFrame()
        }
    }

}
