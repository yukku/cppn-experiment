import * as dl from "deeplearn"

const weights = [];
const NET_SIZE = 20*3
const STDEV = 0.6
const MAX_LAYERS = 6

function addWeight(weights, shape, stdiv) {
    weights.push(dl.variable(dl.randomNormal(shape, 0, STDEV)));
}

addWeight(weights, [3, NET_SIZE], STDEV)
for(let i=0; i < MAX_LAYERS; i++) {
    addWeight(weights, [NET_SIZE, NET_SIZE], STDEV)
}
addWeight(weights, [NET_SIZE, 3], STDEV)

export default class Model{

    static model(inputTensor) {

        let prevOutput = inputTensor
        for (var i = 0; i < weights.length; i++) {
            const matmulResult = prevOutput.matMul(weights[i])
            if(i === weights.length - 1) {
                prevOutput = matmulResult.sigmoid()
            }else{
                // prevOutput = matmulResult.relu()
                prevOutput = matmulResult.tanh()
            }
        }
        return prevOutput
    }

    static getWeight() {
        return weights
    }

}
