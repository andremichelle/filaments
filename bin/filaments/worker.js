import { Options } from "../lib/common.js";
import { TAU } from "../lib/math.js";
import { Scene } from "./model.js";
class Context {
    constructor(width, height) {
        this.scene = new Scene();
        this.offscreenCanvas = new OffscreenCanvas(width, height);
        this.context = this.offscreenCanvas.getContext('2d');
    }
    update(format) {
        this.scene.deserialize(format);
        this.renderFrame(this.offscreenCanvas.width, this.offscreenCanvas.height, 0.0);
        return this.offscreenCanvas.transferToImageBitmap();
    }
    renderFrame(width, height, time) {
        console.time('render');
        const context = this.context;
        context.clearRect(0, 0, width, height);
        context.save();
        context.translate(width / 2, height / 2);
        context.globalAlpha = this.scene.alpha.get();
        context.globalCompositeOperation = 'lighten';
        context.lineWidth = 0.0;
        const path0 = this.scene.paths[0].get();
        const path1 = this.scene.paths[1].get();
        const saturation = Math.min(100, Math.max(0, this.scene.saturation.get() * 100));
        const brightness = Math.min(100, Math.max(0, this.scene.brightness.get() * 100));
        const resolution = this.scene.resolution.get();
        for (let i = 0; i < resolution; ++i) {
            const phase = i / resolution;
            const deg = 180 + Math.sin(phase * TAU) * 30;
            const p0 = path0.eval(phase, Math.ceil(time) - time);
            const p1 = path1.eval(phase, time - Math.floor(time));
            context.beginPath();
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            context.strokeStyle = `hsl(${deg}, ${saturation}%, ${brightness}%)`;
            context.stroke();
        }
        context.restore();
        console.timeEnd('render');
    }
}
let context = Options.None;
self.onmessage = (event) => {
    const message = event.data;
    if (message.type === 'init') {
        context = Options.valueOf(new Context(message.width, message.height));
    }
    else if (message.type === 'update') {
        context.ifPresent(c => self.postMessage({
            type: 'result',
            bitmap: c.update(message.format)
        }, undefined));
    }
};
//# sourceMappingURL=worker.js.map