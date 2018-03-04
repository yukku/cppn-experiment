import * as dl from "deeplearn"

import Util from "./Util.js"
import Model from "./Model.js"
import Webcam from "./Webcam.js"

export default class Training{

    constructor({ canvas, canvas2 }) {

        this.TRAIN_STEPS = 400
        this.LEARNING_RATE = 0.002
        // this.LEARNING_RATE = 0.005

        this.canvas = canvas
        this.webcam = new Webcam({
            canvas: canvas2
        })
        this.z1Counter = 0
        this.z2Counter = 0

        this.costStack = []

        // this.start()
    }

    async start() {

        const [trainingTensor, coordTensor, height, width] = await this.load()
        await this.train(coordTensor, trainingTensor, height, width)

        this.animate(height, width)
    }

    async animate(height, width) {
        this.z1Counter += 0.005
        this.z2Counter += 0.005
        const scale = 4
        const coordTensor = Util.createCoordTensor(height*scale, width*scale, 3)

        const zVars = this.getZvars(this.z1Counter, this.z2Counter, [coordTensor.shape[0], 1])
        const resultTensor = Model.model(coordTensor.concat(zVars, 1))

        const tensor = resultTensor
            .concat(dl.Array2D.ones([height*scale * width*scale, 1]), 1)
            .reshape([ height*scale, width*scale, 4 ])


        await Util.renderToCanvas(tensor, this.canvas, 2)

        // setTimeout(() => {
        //     requestAnimationFrame(() => this.animate(height, width));
        // }, 40);


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

        this.webcam.start()
        // const optimizer = dl.train.sgd(this.LEARNING_RATE)
        // const optimizer = dl.train.momentum(this.LEARNING_RATE)
        // const optimizer = dl.train.adadelta(this.LEARNING_RATE)
        // const optimizer = dl.train.adam(this.LEARNING_RATE)
        // const optimizer = dl.train.adam()
        const optimizer = dl.train.adamax(this.LEARNING_RATE)
        // const optimizer = dl.train.adamax()
        // const optimizer = dl.train.rmsprop(this.LEARNING_RATE)
        // const optimizer = dl.train.adagrad(this.LEARNING_RATE)

        let result

        for (let i = 0; i < this.TRAIN_STEPS; i++) {

            const cost = optimizer.minimize(() => {

                const trainingWebcamTensor = dl.fromPixels(this.webcam.getImageData())
                                    .toFloat()
                                    .div(dl.scalar(255))
                                    .reshape([height*width, 3])



                // this.z1Counter += 0.01
                // this.z2Counter += 0.01


                const zVars = this.getZvars(this.z1Counter, this.z2Counter, [labelTensor.shape[0], 1])
                const resultTensor = Model.model(labelTensor.concat(zVars, 1))
                result = resultTensor.dataSync()

                return dl.losses.softmaxCrossEntropy(trainingWebcamTensor, resultTensor).mean()

            }, true);


            const tensor = dl.Array2D.new([height * width, 3], result)
                .concat(dl.Array2D.ones([height * width, 1]), 1)
                .reshape([ height, width, 4 ])

            await Util.renderToCanvas(tensor, this.canvas, 8)

            if(i%10 == 0){
                const costData = cost.dataSync()
                console.log("steps: " + i, "cost: " + costData)
            }

            await dl.nextFrame()
        }

        return [height, width]
    }

    addToCostStack(costData) {
        this.costStack.push(costData[0])
        if(this.costStack.length > 2) this.costStack.shift()
    }

    costHasIncreased() {

        const threshold = 0.01
        if(this.costStack.length >= 2){
            return (this.costStack[0] + threshold < this.costStack[this.costStack.length - 1])
        }else{
            return false
        }
    }

    getZvars(z1Counter, z2Counter, shape, axis = 1) {
        const z1 = dl.Scalar.new(Math.sin(z1Counter));
        const z2 = dl.Scalar.new(Math.cos(z2Counter));
        const ones = dl.Array2D.ones(shape);
        const z1Mat = z1.mul(ones);
        const z2Mat = z2.mul(ones);
        return z1Mat.concat(z2Mat, axis);
    }

    getWeightAsJson() {
        return Model.getWeightAsJson()
    }

    downloadModel() {
        Util.downloadJson(Model.getWeightAsJson())
    }

}
