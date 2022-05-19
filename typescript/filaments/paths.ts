import {ObservableValue, ObservableValueImpl, Serializer} from "../lib/common.js"
import {TAU} from "../lib/math.js"

export interface Point {
    x: number
    y: number
}

export type PathFormat = CirclePathFormat | NGPathFormat

export interface SceneFormat {
    paths: [PathFormat, PathFormat]
}

export interface Scene {
    paths: [Path<any>, Path<any>]
}

export interface Path<FORMAT extends PathFormat> extends Serializer<FORMAT> {
    eval(phase: number, offset: number): Point
}

export type CirclePathFormat = {
    name: 'circle'
    frequency: number
    radius: number
}

export class CirclePath implements Path<CirclePathFormat> {
    readonly frequency: ObservableValue<number>
    readonly radius: ObservableValue<number>

    constructor(frequency: number = 1, radius: number = 256) {
        this.frequency = new ObservableValueImpl(frequency)
        this.radius = new ObservableValueImpl(radius)
    }

    eval(phase: number, offset: number): Point {
        const angle = (phase * this.frequency.get() + offset) * TAU
        const radius = this.radius.get()
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        }
    }

    deserialize(format: CirclePathFormat): Serializer<CirclePathFormat> {
        this.frequency.set(format.frequency)
        this.radius.set(format.radius)
        return this
    }

    serialize(): CirclePathFormat {
        return {
            name: 'circle',
            frequency: this.frequency.get(),
            radius: this.radius.get()
        }
    }
}

export type NGPathFormat = {
    name: 'polygon'
    n: number
    frequency: number
    radius: number
}

export class PolygonPath implements Path<NGPathFormat> {
    readonly n: ObservableValue<number>
    readonly frequency: ObservableValue<number>
    readonly radius: ObservableValue<number>

    constructor(n: number = 3, frequency: number = 1, radius: number = 256) {
        this.n = new ObservableValueImpl(n)
        this.frequency = new ObservableValueImpl(frequency)
        this.radius = new ObservableValueImpl(radius)
    }

    eval(phase: number, offset: number): Point {
        const n = this.n.get()
        const phaseN = (phase * this.frequency.get()) * n
        const index = Math.floor(phaseN)
        const angleA = index / n * TAU
        const angleB = (index + 1) / n * TAU
        const radius = this.radius.get()
        const ax = Math.cos(angleA) * radius
        const ay = Math.sin(angleA) * radius
        const bx = Math.cos(angleB) * radius
        const by = Math.sin(angleB) * radius
        const ratio = phaseN - index
        return {
            x: ax + ratio * (bx - ax),
            y: ay + ratio * (by - ay)
        }
    }

    deserialize(format: NGPathFormat): Serializer<NGPathFormat> {
        this.n.set(format.n)
        this.frequency.set(format.frequency)
        this.radius.set(format.radius)
        return this
    }

    serialize(): NGPathFormat {
        return {
            name: 'polygon',
            n: this.n.get(),
            frequency: this.frequency.get(),
            radius: this.radius.get()
        }
    }
}

export const createScene = (format: SceneFormat): Scene => {
    const createPath = (name: string): Path<any> => {
        if (name === 'circle') {
            return new CirclePath()
        }
        if (name === 'polygon') {
            return new PolygonPath()
        }
        return null
    }
    const paths: Path<any>[] = format.paths.map(format => (createPath(format.name).deserialize(format) as Path<any>))
    return {
        paths: [paths[0], paths[1]]
    }
}

export type RendererContext =
    & CanvasCompositing
    & CanvasRect
    & CanvasPath
    & CanvasDrawPath
    & CanvasPathDrawingStyles
    & CanvasFillStrokeStyles
    & CanvasState
    & CanvasTransform

export class Renderer {
    static renderFrame(context: RendererContext, paths: [Path<any>, Path<any>], width: number, height: number, time: number): void {
        console.time('render')
        context.clearRect(0, 0, width, height)
        context.save()
        context.translate(width / 2, height / 2)
        context.globalAlpha = 0.1
        context.globalCompositeOperation = 'lighten'
        context.lineWidth = 0.0
        const n = 8192
        for (let i = 0; i < n; ++i) {
            const phase = i / n
            const deg = 180 + Math.sin(phase * TAU) * 30
            const p0 = paths[0].eval(phase, Math.ceil(time) - time)
            const p1 = paths[1].eval(phase, time - Math.floor(time))
            context.beginPath()
            context.moveTo(p0.x, p0.y)
            context.lineTo(p1.x, p1.y)
            context.strokeStyle = `hsl(${deg}, 50%, 50%)`
            context.stroke()
        }
        context.restore()
        console.timeEnd('render')
    }
}