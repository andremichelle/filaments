import { SceneFormat } from "./model.js";
export declare class WorkerQueue {
    private readonly worker;
    private readonly tasks;
    constructor(width: number, height: number);
    render(format: SceneFormat): Promise<ImageBitmap>;
}
