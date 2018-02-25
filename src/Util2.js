import * as Deeplearn from 'deeplearn'


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
                resolve(imageData.data)
            }
            img.src = url;
        })
    }

    static createInput({ buffer, width, height, inputDimensionsNumber}) {
        const coords = new Float32Array(width * height * inputDimensionsNumber);
        let pointer = 0;
        for (let d = 0; d < inputDimensionsNumber; d++) {
            for (let i = 0; i < width * height; i++) {
                const x = i % width
                const y = Math.floor(i / height)
                const coord = this.normalizeCoord(x, y, width, height)
                coords[pointer++] = coord[d]
            }
        }

        return Deeplearn.Array2D.new([inputDimensionsNumber, width * height], coords)
    }

    static normalizeCoord(x, y, width, height) {
        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;
        const normX = (x - halfWidth) / width;
        const normY = (y - halfHeight) / height;
        const r = Math.sqrt(normX * normX + normY * normY);
        return [normX, normY, r] ;
    }

    static getImageNorm(image) {
        const coords = new Float32Array(image.length);
        const width = 100
        const height = 100
        const dimension = 4

        for (let d = 0; d < dimension; d++) {
            for (let i = 0; i < width * height; i++) {
                coords[i + d * width * height] = image[i*dimension + d]/255
            }
        }

        return coords
    }


    static renderToCanvas(array, canvas, scale = 1) {
        return new Promise((resolve, reject) => {

            const ctx = canvas.getContext('2d')
            let [height, width, depth] = array.shape
            depth = (depth) ? depth : 1
            const imageData = new ImageData(width, height)
            canvas.style.width = canvas.width * scale + "px"
            canvas.style.height = canvas.height * scale + "px"

            array.data()
                .then(data => {

                    for (let d = 0; d < depth; d++) {
                        for (let i = 0; i < width * height; i++) {

                            if(d < depth - 1) {
                                imageData.data[i * depth + d] = Math.round(255 * data[i + d * width * height])
                            }else{
                                imageData.data[i * depth + d] = 255
                            }

                        }
                   }

                    ctx.putImageData(imageData, 0, 0)
                    resolve(imageData)
                })
        })

    }


    static renderAllToCanvas(array, canvas, scale = 1) {
        return new Promise((resolve, reject) => {

            const ctx = canvas.getContext('2d')
            let [height, width, depth] = array.shape
            depth = (depth) ? depth : 1
            const imageData = new ImageData(width, height*depth)

            canvas.width = width

            canvas.height = height*depth

            canvas.style.width = canvas.width * scale + "px"
            canvas.style.height = canvas.height * scale + "px"

            array.data()
                .then(data => {
                    console.log(data)

                    let pt = 0
                    for (let d = 0; d < depth; d++) {
                        for (let i = 0; i < width * height; i++) {
                            const j = pt * 4
                            const k = pt
                            imageData.data[j + 0] = Math.round(255 * data[k])
                            imageData.data[j + 1] = Math.round(255 * data[k])
                            imageData.data[j + 2] = Math.round(255 * data[k])
                            imageData.data[j + 3] = 255
                            pt++
                        }
                    }


                    ctx.putImageData(imageData, 0, 0)
                    resolve(imageData)
                })
        })

    }
}
