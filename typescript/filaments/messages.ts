import { SceneFormat } from "./model.js"

export type MessageToWorker = InitMessage | UpdateMessage

export type InitMessage = { type: 'init', width: number, height: number }
export type UpdateMessage = { type: 'update', format: SceneFormat }

export type MessageToMain = { type: 'result', bitmap: ImageBitmap }