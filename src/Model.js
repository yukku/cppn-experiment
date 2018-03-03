// import _ from "lodash"
import * as Deeplearn from "deeplearn"

const weights = [];
const MAT_WIDTH = 20*5
const WEIGHTS_STDEV = 0.6
const MAX_LAYERS = 6



weights.push(Deeplearn.variable(Deeplearn.randomNormal(
    [3, MAT_WIDTH], 0, WEIGHTS_STDEV)));
for(let i=0; i < MAX_LAYERS; i++) {
    weights.push(Deeplearn.variable(Deeplearn.randomNormal(
        [MAT_WIDTH, MAT_WIDTH], 0, WEIGHTS_STDEV)));
}

weights.push(Deeplearn.variable(Deeplearn.randomNormal(
    [MAT_WIDTH, 3], 0, WEIGHTS_STDEV)));

export default class Model{


    static model(xs) {

        let lastOutput = xs
        for (var i = 0; i < weights.length; i++) {
            const matmulResult = lastOutput.matMul(weights[i])

            if(i === weights.length - 1) {
                lastOutput = matmulResult.sigmoid()
            }else{
                // lastOutput = matmulResult.relu()
                lastOutput = matmulResult.tanh()
            }

            // lastOutput = matmulResult.tanh()
            // lastOutput = matmulResult
        }
        return lastOutput
    }



    static getWeight() {
        return weights
    }

}
