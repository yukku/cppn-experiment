// import _ from "lodash"
import * as Deeplearn from "deeplearn"


const weights = [];
const INPUT_DIMENSIONS_NUMBER = 3  // x, y, r
const HIDDEN_VARIABLES_NUMBER = 1 // w
const MAT_WIDTH = 20
// const WEIGHTS_STDEV = 1 / Math.sqrt(MAT_WIDTH)
const WEIGHTS_STDEV = 0.6
const MAX_LAYERS = 8
const NUM_FILTERS = 16

weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
    [NUM_FILTERS, 3, 3, INPUT_DIMENSIONS_NUMBER], 0, WEIGHTS_STDEV)));

weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
    [NUM_FILTERS, MAT_WIDTH, MAT_WIDTH, INPUT_DIMENSIONS_NUMBER], 0, WEIGHTS_STDEV)));

weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
    [NUM_FILTERS, MAT_WIDTH, MAT_WIDTH, INPUT_DIMENSIONS_NUMBER], 0, WEIGHTS_STDEV)));
// for (let i = 0; i < MAX_LAYERS; i++) {
//   weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//       [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV)));
// }
// weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(
//     [MAT_WIDTH, 4], 0, WEIGHTS_STDEV)));



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



// weights.push(Deeplearn.variable(Deeplearn.randomNormal(
//     [MAT_WIDTH*MAT_WIDTH, 4], 0, WEIGHTS_STDEV)));


export default class Model{

    // static model(xs) {
    //     var lastOutput = xs
    //     for (var i = 0; i < weights.length; i++) {
    //         lastOutput = lastOutput.matMul(weights[i])
    //     }
    //     return lastOutput
    // }

    static model(xs) {
        const layer1 = this.convLayer(xs, 0, 1, true)
    }


    static convLayer(input, wi, strides, relu) {
        const y = input.conv2d(weights[wi], [strides, strides],'same')
        const y2 = this.instanceNorm(y, wi + 1);
        return (relu) ? y2.relu() : y2
    }

    static instanceNorm(input, wi) {
        const [height, width, depth] = input.shape
        const moments = Deeplearn.moments(input, [0, 1])
        const shift = weights[wi]
        const scale = weights[wi + 1]
        const epsilon = Deeplearn.scalar(1e-3)

        const normalized = input
            .sub(moments.mean.asType("int32"))
            .div(moments.variance.add(epsilon).sqrt());

        const shifted = scale.mul(normalized).add(shift);

        return shifted.as3D(height, width, depth);
    }


    static getWeight() {
        return weights
    }

}
