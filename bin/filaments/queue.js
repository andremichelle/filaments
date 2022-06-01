var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class WorkerQueue {
    constructor(width, height) {
        this.worker = new Worker('bin/filaments/worker.js', { type: "module" });
        this.tasks = [];
        this.worker.postMessage({ type: 'init', width, height });
        this.worker.onmessage = event => {
            const message = event.data;
            this.tasks.shift()(message.bitmap);
        };
    }
    render(format) {
        return __awaiter(this, void 0, void 0, function* () {
            this.worker.postMessage({ type: 'update', format });
            return new Promise(resolve => this.tasks.push(resolve));
        });
    }
}
//# sourceMappingURL=queue.js.map