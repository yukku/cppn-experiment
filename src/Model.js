// import _ from "lodash"
import * as Deeplearn from "deeplearn"


const weights = [];
const INPUT_DIMENSIONS_NUMBER = 3  // x, y, r
const HIDDEN_VARIABLES_NUMBER = 1 // w
const MAT_WIDTH = 100
const WEIGHTS_STDEV = 0.34
const MAX_LAYERS = 2

weights.push(Deeplearn.truncatedNormal(
    [MAT_WIDTH, INPUT_DIMENSIONS_NUMBER + HIDDEN_VARIABLES_NUMBER], 0, WEIGHTS_STDEV));
for (let i = 0; i < MAX_LAYERS; i++) {
  weights.push(Deeplearn.truncatedNormal(
      [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV));
}

weights.push(Deeplearn.Array2D.randTruncatedNormal(
    [ 4, MAT_WIDTH], 0, WEIGHTS_STDEV));


export default class Model{

    static model(xs) {
        var lastOutput = xs

        for (var i = 0; i < weights.length; i++) {
            // console.log(xs)
            // console.log(weights[i])
            lastOutput = lastOutput.matMul(weights[i])
            // weights[i].matMul(xs)
        }
        return lastOutput
    }
}
