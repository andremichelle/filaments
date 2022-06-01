var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NumericStepper, PrintMapping, Terminator } from "../lib/common.js";
import { TypeSwitchEditor, UIControllerLayout } from "../lib/controls.js";
import { HTML } from "../lib/dom.js";
import { CirclePath, PolygonPath, Scene } from "./model.js";
import { WorkerQueue } from "./queue.js";
class PathControlBuilder {
    constructor(update) {
        this.update = update;
        this.terminator = new Terminator();
        this.availableTypes = PathControlBuilder.TYPES;
    }
    build(layout, path) {
        if (path instanceof CirclePath) {
            layout.createNumericInput('Freq', PrintMapping.FLOAT_ONE).with(path.frequency);
            layout.createNumericInput('Radius', PrintMapping.FLOAT_ONE).with(path.radius);
            this.terminator.with(path.frequency.addObserver(() => this.update(), false));
            this.terminator.with(path.radius.addObserver(() => this.update(), false));
            this.update();
        }
        else if (path instanceof PolygonPath) {
            layout.createNumericInput('N', PrintMapping.INTEGER).with(path.n);
            layout.createNumericInput('Freq', PrintMapping.FLOAT_ONE).with(path.frequency);
            layout.createNumericInput('Radius', PrintMapping.FLOAT_ONE).with(path.radius);
            layout.createNumericInput('Resolution', PrintMapping.INTEGER).with(path.resolution);
            this.terminator.with(path.n.addObserver(() => this.update(), false));
            this.terminator.with(path.frequency.addObserver(() => this.update(), false));
            this.terminator.with(path.radius.addObserver(() => this.update(), false));
            this.terminator.with(path.resolution.addObserver(() => this.update(), false));
            this.update();
        }
    }
}
PathControlBuilder.TYPES = new Map([
    ["Circle", CirclePath],
    ["Polygon", PolygonPath],
]);
const scene = new Scene();
const renderer = new WorkerQueue(2048, 2048);
export const install = (context) => {
    const update = (() => {
        let working = false;
        let changes = false;
        return () => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`update: working: ${working}, changes: ${changes}`);
            if (working) {
                changes = true;
                return;
            }
            working = true;
            context.transferFromImageBitmap(yield renderer.render(scene.serialize()));
            working = false;
            changes = false;
        });
    })();
    scene.resolution.addObserver(update, false);
    scene.brightness.addObserver(update, false);
    scene.saturation.addObserver(update, false);
    scene.alpha.addObserver(update, false);
    update().then(() => console.log('ready'));
    {
        const layout = new UIControllerLayout();
        layout.createNumericInput('Path Count', PrintMapping.INTEGER).with(scene.resolution);
        layout.createNumericStepper('Brightness', PrintMapping.UnipolarPercent, NumericStepper.Hundredth).with(scene.brightness);
        layout.createNumericStepper('Saturation', PrintMapping.UnipolarPercent, NumericStepper.Hundredth).with(scene.saturation);
        layout.createNumericInput('Alpha', PrintMapping.UnipolarPercent).with(scene.alpha);
        HTML.query('.global').appendChild(layout.element());
    }
    {
        const layout = new UIControllerLayout();
        HTML.query('.pathA').appendChild(layout.element());
        new TypeSwitchEditor(layout.element(), new PathControlBuilder(update), "Path").with(scene.paths[0]);
    }
    {
        const layout = new UIControllerLayout();
        HTML.query('.pathB').appendChild(layout.element());
        new TypeSwitchEditor(layout.element(), new PathControlBuilder(update), "Path").with(scene.paths[1]);
    }
};
//# sourceMappingURL=controls.js.map