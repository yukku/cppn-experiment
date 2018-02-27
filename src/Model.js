// import _ from "lodash"
import * as Deeplearn from "deeplearn"


const weights = [];
const INPUT_DIMENSIONS_NUMBER = 3  // x, y, r
const HIDDEN_VARIABLES_NUMBER = 1 // w
const MAT_WIDTH = 100
// const WEIGHTS_STDEV = 1 / Math.sqrt(100 * 100)
const WEIGHTS_STDEV = 0.3
const MAX_LAYERS = 6

weights.push(Deeplearn.variable(Deeplearn.randomNormal(
    [INPUT_DIMENSIONS_NUMBER + HIDDEN_VARIABLES_NUMBER, MAT_WIDTH], 0, WEIGHTS_STDEV)));
for (let i = 0; i < MAX_LAYERS; i++) {
  weights.push(Deeplearn.variable(Deeplearn.randomNormal(
      [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV)));
}
weights.push(Deeplearn.variable(Deeplearn.Array2D.randTruncatedNormal(
    [MAT_WIDTH, 4], 0, WEIGHTS_STDEV)));


export default class Model{

    static model(xs) {
        var lastOutput = xs
        for (var i = 0; i < weights.length; i++) {
            lastOutput = lastOutput.matMul(weights[i])
        }
        return lastOutput
    }

    static getWeight() {
        return weights
    }

}
