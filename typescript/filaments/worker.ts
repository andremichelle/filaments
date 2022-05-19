import {Option, Options} from "../lib/common.js"
import {MessageToMain, MessageToWorker} from "./messages.js"
import {createScene, Renderer, Scene} from "./paths.js"

class Context {
    private readonly offscreenCanvas: OffscreenCanvas
    private readonly context: OffscreenCanvasRenderingContext2D

    constructor(width: number, height: number) {
        this.offscreenCanvas = new OffscreenCanvas(width, height)
        this.context = this.offscreenCanvas.getContext('2d')
    }

    render(scene: Scene): ImageBitmap {
        Renderer.renderFrame(this.context, scene.paths,
            this.offscreenCanvas.width, this.offscreenCanvas.height, 0.0)
        return this.offscreenCanvas.transferToImageBitmap()
    }
}

let context: Option<Context> = Options.None

self.onmessage = (event: MessageEvent) => {
    const message: MessageToWorker = event.data
    if (message.type === 'init') {
        context = Options.valueOf(new Context(message.width, message.height))
    } else if (message.type === 'update') {
        context.ifPresent(r => self.postMessage({
            type: 'result',
            bitmap: r.render(createScene(message.format))
        } as MessageToMain, undefined))
    }
}