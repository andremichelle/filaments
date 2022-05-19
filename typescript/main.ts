import {InitMessage, MessageToMain, UpdateMessage} from "./filaments/messages.js"
import {PathFormat, PolygonPath} from "./filaments/paths.js"
import {Boot, preloadImagesOfCssFile} from "./lib/boot.js"
import {HTML} from "./lib/dom.js"

const showProgress = (() => {
    const progress: SVGSVGElement = document.querySelector("svg.preloader")
    window.onerror = () => progress.classList.add("error")
    window.onunhandledrejection = () => progress.classList.add("error")
    return (percentage: number) => progress.style.setProperty("--percentage", percentage.toFixed(2))
})();

(async () => {
    console.debug("booting...")

    // --- BOOT STARTS ---

    const boot = new Boot()
    boot.addObserver(boot => showProgress(boot.normalizedPercentage()))
    boot.registerProcess(preloadImagesOfCssFile("./bin/main.css"))
    await boot.waitForCompletion()

    // --- BOOT ENDS ---

    const canvas: HTMLCanvasElement = HTML.create('canvas')
    const bitmapRenderingContext = canvas.getContext('bitmaprenderer')

    const size = 2048
    const worker = new Worker('bin/filaments/worker.js', {type: "module"})
    worker.onmessage = event => {
        const message: MessageToMain = event.data
        bitmapRenderingContext.transferFromImageBitmap(message.bitmap)
    }

    const paths: PathFormat[] = [
        new PolygonPath(4, 1, 512),
        new PolygonPath(4, 11, 128)
    ].map(path => path.serialize())

    worker.postMessage({type: 'init', width: size, height: size} as InitMessage)
    worker.postMessage({type: 'update', format: {paths}} as UpdateMessage)

    canvas.width = 2048
    canvas.height = 2048
    canvas.style.width = '1024px'
    canvas.style.height = '1024px'
    canvas.style.backgroundColor = 'black'
    HTML.query('main').appendChild(canvas)

    // prevent dragging entire document on mobile
    document.addEventListener('touchmove', (event: TouchEvent) => event.preventDefault(), {passive: false})
    document.addEventListener('dblclick', (event: Event) => event.preventDefault(), {passive: false})
    const resize = () => document.body.style.height = `${window.innerHeight}px`
    window.addEventListener("resize", resize)
    resize()
    requestAnimationFrame(() => {
        document.querySelectorAll("body svg.preloader").forEach(element => element.remove())
        document.querySelectorAll("body main").forEach(element => element.classList.remove("invisible"))
    })
    console.debug("boot complete.")
})()