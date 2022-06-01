import { ObservableValueImpl, Terminator } from "../lib/common.js";
import { TAU } from "../lib/math.js";
export class Scene {
    constructor() {
        this.paths = [
            new ObservableValueImpl(new PolygonPath(4, 1, 1024)),
            new ObservableValueImpl(new PolygonPath(4, 11, 256))
        ];
        this.resolution = new ObservableValueImpl(1 << 13);
        this.alpha = new ObservableValueImpl(0.04);
        this.saturation = new ObservableValueImpl(0.75);
        this.brightness = new ObservableValueImpl(0.50);
    }
    serialize() {
        return {
            paths: this.paths.map(p => p.get().serialize()),
            resolution: this.resolution.get(),
            alpha: this.alpha.get(),
            saturation: this.saturation.get(),
            brightness: this.brightness.get(),
        };
    }
    deserialize(format) {
        this.paths.forEach((path, index) => {
            const pathFormat = format.paths[index];
            path.set(Scene.createPath(pathFormat.name).deserialize(pathFormat));
        });
        this.resolution.set(format.resolution);
        this.alpha.set(format.alpha);
        this.saturation.set(format.saturation);
        this.brightness.set(format.brightness);
        return this;
    }
    static createPath(name) {
        if (name === 'circle')
            return new CirclePath();
        if (name === 'polygon')
            return new PolygonPath();
        throw new Error('unknown path-format');
    }
}
export class CirclePath {
    constructor(frequency = 1, radius = 256) {
        this.terminator = new Terminator();
        this.frequency = this.terminator.with(new ObservableValueImpl(frequency));
        this.radius = this.terminator.with(new ObservableValueImpl(radius));
    }
    eval(phase, offset) {
        const angle = (phase * this.frequency.get() + offset) * TAU;
        const radius = this.radius.get();
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }
    deserialize(format) {
        this.frequency.set(format.frequency);
        this.radius.set(format.radius);
        return this;
    }
    serialize() {
        return {
            name: 'circle',
            frequency: this.frequency.get(),
            radius: this.radius.get()
        };
    }
    terminate() {
        this.terminator.terminate();
    }
}
export class PolygonPath {
    constructor(n = 3, frequency = 1, radius = 256, resolution = 0) {
        this.terminator = new Terminator();
        this.n = this.terminator.with(new ObservableValueImpl(n));
        this.frequency = this.terminator.with(new ObservableValueImpl(frequency));
        this.radius = this.terminator.with(new ObservableValueImpl(radius));
        this.resolution = this.terminator.with(new ObservableValueImpl(resolution));
    }
    eval(phase, offset) {
        const n = this.n.get();
        const phaseN = (phase * this.frequency.get()) * n;
        const index = Math.floor(phaseN);
        const angleA = index / n * TAU;
        const angleB = (index + 1) / n * TAU;
        const radius = this.radius.get();
        const ax = Math.cos(angleA) * radius;
        const ay = Math.sin(angleA) * radius;
        const bx = Math.cos(angleB) * radius;
        const by = Math.sin(angleB) * radius;
        const resolution = this.resolution.get();
        const ratio = 0 === resolution ? phaseN - index : Math.round((phaseN - index) * resolution) / resolution;
        return {
            x: ax + ratio * (bx - ax),
            y: ay + ratio * (by - ay)
        };
    }
    deserialize(format) {
        this.n.set(format.n);
        this.frequency.set(format.frequency);
        this.radius.set(format.radius);
        this.resolution.set(format.resolution);
        return this;
    }
    serialize() {
        return {
            name: 'polygon',
            n: this.n.get(),
            frequency: this.frequency.get(),
            radius: this.radius.get(),
            resolution: this.resolution.get()
        };
    }
    terminate() {
        this.terminator.terminate();
    }
}
//# sourceMappingURL=model.js.map