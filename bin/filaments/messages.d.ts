import { SceneFormat } from "./model.js";
export declare type MessageToWorker = InitMessage | UpdateMessage;
export declare type InitMessage = {
    type: 'init';
    width: number;
    height: number;
};
export declare type UpdateMessage = {
    type: 'update';
    format: SceneFormat;
};
export declare type MessageToMain = {
    type: 'result';
    bitmap: ImageBitmap;
};
