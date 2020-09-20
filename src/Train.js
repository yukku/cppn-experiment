// import _ from "lodash"
import * as Deeplearn from "deeplearn";
import Util from "./Util2.js";
import Model from "./Model.js";
import App from "./App2.js";

export default class Train {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas2 = document.createElement("canvas");

    this.weights = Deeplearn.variable(
      Deeplearn.randomNormal([100 * 100, 4], 0, 1 / Math.sqrt(100 * 100))
    );

    let labels = Deeplearn.Array2D.ones([100 * 100, 4]);
    // console.log(labels.dataSync())
    Util.getImage("profile-22.jpg").then((buffer) => {
      var imageTensor = Deeplearn.Array2D.new(
        [100 * 100, 4],
        Util.getImageNorm(buffer, 100, 100)
      );

      this.train(labels, imageTensor).then(() => {
        const app = new App(this.canvas);
        // this.test()
      });
    });
  }

  test() {
    Util.getImage("profile-22.jpg").then((buffer) => {
      const imageTensor = Deeplearn.Array2D.new(
        [100 * 100, 4],
        Util.getImageNorm(buffer, 100, 100)
      );
      const score = this.predict(imageTensor);
      console.log("true result: ", Array.from(score.dataSync()));

      let reshaped = score.reshape([100, 100, 1]);

      Util.renderToCanvas(reshaped, this.canvas, 3);
    });

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

  async train(labels, imageTensor) {
    const TRAIN_STEPS = 100;
    const LEARNING_RATE = 0.0000000001;
    const optimizer = Deeplearn.train.sgd(LEARNING_RATE);
    // const optimizer = Deeplearn.train.momentum(LEARNING_RATE)
    // const optimizer = Deeplearn.train.adadelta(LEARNING_RATE)
    // const optimizer = Deeplearn.train.adam(LEARNING_RATE)
    // const optimizer = Deeplearn.train.adamax(LEARNING_RATE) //
    // const optimizer = Deeplearn.train.rmsprop(LEARNING_RATE)
    // const optimizer = Deeplearn.train.adagrad(LEARNING_RATE)

    for (let i = 0; i < TRAIN_STEPS; i++) {
      const cost = optimizer.minimize(() => {
        return Deeplearn.losses
          .softmaxCrossEntropy(labels, Model.model(imageTensor))
          .mean();
      }, true);
      console.log("cost: " + cost.dataSync());
      await Deeplearn.nextFrame();
    }

    let reshaped = this.weights.reshape([100, 100, 4]);

    Util.renderToCanvas(reshaped, this.canvas, 6);

    // console.log(this.weights.dataSync())
  }

  predict(imageTensor) {
    const pred = Deeplearn.tidy(() => {
      const axis = 1;
      return Model.model(imageTensor).argMax(axis);
    });
    // console.log(pred)
    let reshaped = pred.reshape([100, 100, 1]);

    Util.renderToCanvas(reshaped, this.canvas, 6);

    return pred;
  }

  getCanvas() {
    return this.canvas;
  }
  getCanvas2() {
    return this.canvas2;
  }
}
