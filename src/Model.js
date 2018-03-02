// import _ from "lodash"
import * as Deeplearn from "deeplearn"


const weights = [];

function addWeight(shape) {
    weights.push(Deeplearn.variable(Deeplearn.truncatedNormal(shape, 0, WEIGHTS_STDEV)))
}

const INPUT_DIMENSIONS_NUMBER = 3  // x, y, r
const HIDDEN_VARIABLES_NUMBER = 1 // w
const MAT_WIDTH = 20
// const WEIGHTS_STDEV = 1 / Math.sqrt(MAT_WIDTH)
const WEIGHTS_STDEV = 0.6
const MAX_LAYERS = 8
const NUM_FILTERS = 16


addWeight([9, 9, 3, 32])
addWeight([32])
addWeight([32])
addWeight([3, 3, 32, 64])
addWeight([64])
addWeight([64])
addWeight([3, 3, 64, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 128, 128 ])
addWeight([128])
addWeight([128])
addWeight([3, 3, 64, 128 ])
addWeight([64])
addWeight([64])
addWeight([3, 3, 32, 64 ])
addWeight([32])
addWeight([32])
addWeight([9, 9, 32, 3 ])
addWeight([3])
addWeight([3])







export default class Model{

    // static model(xs) {
    //     var lastOutput = xs
    //     for (var i = 0; i < weights.length; i++) {
    //         lastOutput = lastOutput.matMul(weights[i])
    //     }
    //     return lastOutput
    // }

    static model(xs) {
        this.timesScalar = Deeplearn.scalar(150);
        this.plusScalar = Deeplearn.scalar(255. / 2);

        const conv1 = this.convLayer(xs.toFloat(), 1, true, 0)
        const conv2 = this.convLayer(conv1, 2, true, 3);
        const conv3 = this.convLayer(conv2, 2, true, 6);
        const resid1 = this.residualBlock(conv3, 9);
        const resid2 = this.residualBlock(resid1, 15);
        const resid3 = this.residualBlock(resid2, 21);
        const resid4 = this.residualBlock(resid3, 27);
        const resid5 = this.residualBlock(resid4, 33);
        const convT1 = this.convTransposeLayer(resid5, 64, 2, 39);
        const convT2 = this.convTransposeLayer(convT1, 32, 2, 42);
        const convT3 = this.convLayer(convT2, 1, false, 45);

        return convT3.tanh()
                   .mul(this.timesScalar)
                   .add(this.plusScalar)
                   .clipByValue(0, 255)
                   .div(Deeplearn.scalar(255));

    }


    static convLayer(input, strides, relu, wi) {
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
            .sub(moments.mean)
            .div(moments.variance.add(epsilon).sqrt());

        const shifted = scale.mul(normalized).add(shift);

        return shifted.as3D(height, width, depth);
    }

    static convTransposeLayer(input, numFilters, strides, varId) {
        const [height, width, ] = input.shape;
        const newRows = height * strides;
        const newCols = width * strides;
        const newShape = [newRows, newCols, numFilters];

        const y = input.conv2dTranspose( weights[varId], newShape, [strides, strides], 'same')
        // console.log(y)
        return this.instanceNorm(y, varId + 1).relu();
      }

    static residualBlock(input, varId) {
        const conv1 = this.convLayer(input, 1, true, varId);
        const conv2 = this.convLayer(conv1, 1, false, varId + 3);
        return conv2.addStrict(input);
    }


    static getWeight() {
        return weights
    }

}
