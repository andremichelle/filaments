import {NumericStepper, PrintMapping} from "../lib/common.js"
import {UIControllerLayout} from "../lib/controls.js"
import {HTML} from "../lib/dom.js"
import {Scene} from "./model.js"
import {WorkerQueue} from "./queue.js"

// TODO Introduce bounded number values (min, max)

const scene = new Scene()
const renderer = new WorkerQueue(2048, 2048)

export const install = (context: ImageBitmapRenderingContext): void => {
    const controls: HTMLElement = HTML.query('.controls')

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

    const layout = new UIControllerLayout()
    layout.createNumericInput('Path Count', PrintMapping.INTEGER).with(scene.resolution)
    layout.createNumericStepper('Brightness', PrintMapping.UnipolarPercent, NumericStepper.Hundredth).with(scene.brightness)
    layout.createNumericStepper('Saturation', PrintMapping.UnipolarPercent, NumericStepper.Hundredth).with(scene.saturation)
    layout.createNumericInput('Alpha', PrintMapping.UnipolarPercent).with(scene.alpha)
    controls.appendChild(layout.element())
}