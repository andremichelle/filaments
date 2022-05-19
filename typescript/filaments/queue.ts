import {InitMessage, MessageToMain, UpdateMessage} from "./messages.js"
import {SceneFormat} from "./model.js"

export class WorkerQueue {
    private readonly worker = new Worker('bin/filaments/worker.js', {type: "module"})
    private readonly tasks: ((bitmap: ImageBitmap) => void)[] = []

    constructor(width: number, height: number) {
        this.worker.postMessage({type: 'init', width, height} as InitMessage)
        this.worker.onmessage = event => {
            const message: MessageToMain = event.data
            this.tasks.shift()(message.bitmap)
        }
    }

    async render(format: SceneFormat): Promise<ImageBitmap> {
        this.worker.postMessage({type: 'update', format} as UpdateMessage)
        return new Promise<ImageBitmap>(resolve => this.tasks.push(resolve))
    }
}