import * as dl from "deeplearn"

export default class Util{

    static getImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                var canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                var ctx = canvas.getContext("2d")
                ctx.drawImage(img, 0, 0, img.width, img.height)
                var imageData = ctx.getImageData(0, 0, img.width, img.height)
                resolve(imageData)
            }
            img.src = url;
        })
    }

    static createCoordTensor(height, width, inputDimensionsNumber) {
        const coords = new Float32Array(height * width * inputDimensionsNumber);
        let pointer = 0;
        for (let i = 0; i < height*width; i++) {
            for (let d = 0; d < inputDimensionsNumber; d++) {
                const x = i % width
                const y = Math.floor(i / height)
                const coord = this.normalizeCoord(x, y, width, height)
                coords[pointer++] = coord[d]
            }
        }

        return dl.Array2D.new([width * height, inputDimensionsNumber], coords)
    }

    static normalizeCoord(x, y, width, height) {
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;
        const normX = (x - halfWidth) / width;
        const normY = (y - halfHeight) / height;
        return [normX, normY, 1] ;
    }

    static renderToCanvas(tensor, canvas, scale = 1) {
        return new Promise((resolve, reject) => {
            const ctx = canvas.getContext('2d')
            let [height, width, depth] = tensor.shape
            depth = (depth) ? depth : 1
            const imageData = new ImageData(width, height)

            tensor.data()
                .then(data => {

                    canvas.width = width
                    canvas.height = height
                    canvas.style.width = canvas.width * scale + "px"
                    canvas.style.height = canvas.height * scale + "px"

                    for (let d = 0; d < depth; d++) {
                        for (let i = 0; i < width * height; i++) {
                            imageData.data[i + d * width * height]= Math.round(255 * data[i + d * width * height])
                        }
                   }
                    ctx.putImageData(imageData, 0, 0)
                    resolve(imageData)
                })
        })

    }

    static downloadJson(json) {
        var data = "text/json;charset=utf-8," + encodeURIComponent(json);
        var a = document.createElement('a');
        a.href = 'data:' + data;
        a.download = 'cppn-experiment-checkpoint.json';
        a.innerHTML = 'download JSON';
        a.click()
        // var container = document.getElementById('download_json_container');
        // container.appendChild(a);
    }

}
