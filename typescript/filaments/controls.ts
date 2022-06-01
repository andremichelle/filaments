import {NoArgType, NumericStepper, PrintMapping, Terminator} from "../lib/common.js"
import {ControlBuilder, TypeSwitchEditor, UIControllerLayout} from "../lib/controls.js"
import {HTML} from "../lib/dom.js"
import {CirclePath, Path, PathType, PolygonPath, Scene} from "./model.js"
import {WorkerQueue} from "./queue.js"

// TODO Introduce bounded number values (min, max)

class PathControlBuilder implements ControlBuilder<Path<any>> {
    private static TYPES = new Map<string, PathType>([
        ["Circle", CirclePath],
        ["Polygon", PolygonPath],
    ])

    private readonly terminator: Terminator = new Terminator()

    constructor(private readonly update: () => void) {
    }

    build(layout: UIControllerLayout, path: Path<any>): void {
        if (path instanceof CirclePath) {
            layout.createNumericInput('Freq', PrintMapping.FLOAT_ONE).with(path.frequency)
            layout.createNumericInput('Radius', PrintMapping.FLOAT_ONE).with(path.radius)
            this.terminator.with(path.frequency.addObserver(() => this.update(), false))
            this.terminator.with(path.radius.addObserver(() => this.update(), false))
            this.update()
        } else if (path instanceof PolygonPath) {
            layout.createNumericInput('N', PrintMapping.INTEGER).with(path.n)
            layout.createNumericInput('Freq', PrintMapping.FLOAT_ONE).with(path.frequency)
            layout.createNumericInput('Radius', PrintMapping.FLOAT_ONE).with(path.radius)
            layout.createNumericInput('Resolution', PrintMapping.INTEGER).with(path.resolution)
            this.terminator.with(path.n.addObserver(() => this.update(), false))
            this.terminator.with(path.frequency.addObserver(() => this.update(), false))
            this.terminator.with(path.radius.addObserver(() => this.update(), false))
            this.terminator.with(path.resolution.addObserver(() => this.update(), false))
            this.update()
        }
    }

    availableTypes: Map<string, NoArgType<Path<any>>> = PathControlBuilder.TYPES
}

const scene = new Scene()
const renderer = new WorkerQueue(2048, 2048)

export const install = (context: ImageBitmapRenderingContext): void => {
    const update = (() => {
        let working = false
        let changes = false
        return async () => {
            console.log(`update: working: ${working}, changes: ${changes}`)
            if (working) {
                changes = true
                return
            }
            working = true
            context.transferFromImageBitmap(await renderer.render(scene.serialize()))
            working = false
            changes = false
        }
    })()

    scene.resolution.addObserver(update, false)
    scene.brightness.addObserver(update, false)
    scene.saturation.addObserver(update, false)
    scene.alpha.addObserver(update, false)
    update().then(() => console.log('ready'))

    {
        const layout = new UIControllerLayout()
        layout.createNumericInput('Path Count', PrintMapping.INTEGER).with(scene.resolution)
        layout.createNumericStepper('Brightness', PrintMapping.UnipolarPercent, NumericStepper.Hundredth).with(scene.brightness)
        layout.createNumericStepper('Saturation', PrintMapping.UnipolarPercent, NumericStepper.Hundredth).with(scene.saturation)
        layout.createNumericInput('Alpha', PrintMapping.UnipolarPercent).with(scene.alpha)
        HTML.query('.global').appendChild(layout.element())
    }
    {
        const layout = new UIControllerLayout()
        HTML.query('.pathA').appendChild(layout.element())
        new TypeSwitchEditor(layout.element(), new PathControlBuilder(update), "Path").with(scene.paths[0])
    }
    {
        const layout = new UIControllerLayout()
        HTML.query('.pathB').appendChild(layout.element())
        new TypeSwitchEditor(layout.element(), new PathControlBuilder(update), "Path").with(scene.paths[1])
    }
}