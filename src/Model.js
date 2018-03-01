// import _ from "lodash"
import * as Deeplearn from "deeplearn"


const weights = [];
const INPUT_DIMENSIONS_NUMBER = 3  // x, y, r
const HIDDEN_VARIABLES_NUMBER = 1 // w
const MAT_WIDTH = 28
// const WEIGHTS_STDEV = 1 / Math.sqrt(MAT_WIDTH)
const WEIGHTS_STDEV = 0.6
const MAX_LAYERS = 3

// weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//     [INPUT_DIMENSIONS_NUMBER + HIDDEN_VARIABLES_NUMBER, MAT_WIDTH], 0, WEIGHTS_STDEV)));
// for (let i = 0; i < MAX_LAYERS; i++) {
//   weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//       [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV)));
// }
// weights.push(Deeplearn.variable(Deeplearn.Array2D.randTruncatedNormal(
//     [MAT_WIDTH, 4], 0, WEIGHTS_STDEV)));

// weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//     [MAT_WIDTH*MAT_WIDTH, INPUT_DIMENSIONS_NUMBER + HIDDEN_VARIABLES_NUMBER], 0, WEIGHTS_STDEV)));

// weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//     [INPUT_DIMENSIONS_NUMBER + HIDDEN_VARIABLES_NUMBER, MAT_WIDTH], 0, WEIGHTS_STDEV)));
// for (let i = 0; i < MAX_LAYERS; i++) {
//   weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//       [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV)));
// }
// weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//     [MAT_WIDTH, 4], 0, WEIGHTS_STDEV)));
// weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//     [4, 1], 0, WEIGHTS_STDEV)));
// weights.push(Deeplearn.variable(Deeplearn.randomNormal(
//     [4, MAT_WIDTH*MAT_WIDTH], 0, WEIGHTS_STDEV)));
weights.push(Deeplearn.variable(Deeplearn.randomNormal(
    [MAT_WIDTH*MAT_WIDTH, 4], 0, WEIGHTS_STDEV)));
// weights.push(Deeplearn.variable(Deeplearn.randomNormal(
//     [4, 4], 0, WEIGHTS_STDEV)));

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
