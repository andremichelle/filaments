import {ObservableValue, ObservableValueImpl, Serializer} from "../lib/common.js"
import {TAU} from "../lib/math.js"

export interface Point {
    x: number
    y: number
}

export type PathFormat = CirclePathFormat | PolygonPathFormat

export interface SceneFormat {
    paths: PathFormat[]
    resolution: number
    alpha: number
    saturation: number
    brightness: number
}

export class Scene implements Serializer<SceneFormat> {
    readonly paths: ObservableValue<Path<any>>[] = [
        new ObservableValueImpl<Path<any>>(new PolygonPath(4, 1, 1024)),
        new ObservableValueImpl<Path<any>>(new PolygonPath(4, 11, 256))
    ]
    readonly resolution: ObservableValue<number> = new ObservableValueImpl(1 << 13)
    readonly alpha: ObservableValue<number> = new ObservableValueImpl(0.04)
    readonly saturation: ObservableValue<number> = new ObservableValueImpl(0.75)
    readonly brightness: ObservableValue<number> = new ObservableValueImpl(0.50)

    serialize(): SceneFormat {
        return {
            paths: this.paths.map(p => p.get().serialize()),
            resolution: this.resolution.get(),
            alpha: this.alpha.get(),
            saturation: this.saturation.get(),
            brightness: this.brightness.get(),
        }
    }

    deserialize(format: SceneFormat): Serializer<SceneFormat> {
        this.paths.forEach((path: ObservableValue<Path<any>>, index: number) => {
            const pathFormat: PathFormat = format.paths[index]
            path.set(Scene.createPath(pathFormat.name).deserialize(pathFormat) as Path<any>)
        })
        this.resolution.set(format.resolution)
        this.alpha.set(format.alpha)
        this.saturation.set(format.saturation)
        this.brightness.set(format.brightness)
        return this
    }

    private static createPath(name: string): Path<any> {
        if (name === 'circle') return new CirclePath()
        if (name === 'polygon') return new PolygonPath()
        throw new Error('unknown path-format')
    }
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

export type PolygonPathFormat = {
    name: 'polygon'
    n: number
    frequency: number
    radius: number
    resolution: number
}

export class PolygonPath implements Path<PolygonPathFormat> {
    readonly n: ObservableValue<number>
    readonly frequency: ObservableValue<number>
    readonly radius: ObservableValue<number>
    readonly resolution: ObservableValue<number>

    constructor(n: number = 3, frequency: number = 1, radius: number = 256, resolution: number = 0) {
        this.n = new ObservableValueImpl(n)
        this.frequency = new ObservableValueImpl(frequency)
        this.radius = new ObservableValueImpl(radius)
        this.resolution = new ObservableValueImpl(resolution) // zero is maximum
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
        const resolution = this.resolution.get()
        const ratio = 0 === resolution ? phaseN - index : Math.round((phaseN - index) * resolution) / resolution
        return {
            x: ax + ratio * (bx - ax),
            y: ay + ratio * (by - ay)
        }
    }

    deserialize(format: PolygonPathFormat): Serializer<PolygonPathFormat> {
        this.n.set(format.n)
        this.frequency.set(format.frequency)
        this.radius.set(format.radius)
        this.resolution.set(format.resolution)
        return this
    }

    serialize(): PolygonPathFormat {
        return {
            name: 'polygon',
            n: this.n.get(),
            frequency: this.frequency.get(),
            radius: this.radius.get(),
            resolution: this.resolution.get()
        }
    }
}