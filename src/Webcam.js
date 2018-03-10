

export default class Webcam{

    constructor({ canvas } = {}) {
        this.videoEl = document.createElement('video')
        this.canvas =  (!canvas) ? document.createElement("canvas") : canvas
        this.canvas.width = 120
        this.canvas.height = 80
        this.context = this.canvas.getContext('2d')
    }

    async start() {
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            this.videoEl.src = window.URL.createObjectURL(stream)
            this.videoEl.play()

            // this.update()
        }
    }

    getImageData() {
        this.context.drawImage(this.videoEl, 0, 0, this.canvas.width ,this.canvas.height);
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    }

    update() {
        this.context.drawImage(this.videoEl, 0, 0, this.canvas.width ,this.canvas.height);

        setTimeout(() => {
            requestAnimationFrame(() => this.update());
        }, 100);

    }




}
