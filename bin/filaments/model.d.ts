import { ObservableValue, Serializer, Terminable } from "../lib/common.js";
export interface Point {
    x: number;
    y: number;
}
export declare type PathFormat = CirclePathFormat | PolygonPathFormat;
export declare type PathType = {
    new (): Path<any>;
};
export interface SceneFormat {
    paths: PathFormat[];
    resolution: number;
    alpha: number;
    saturation: number;
    brightness: number;
}
export declare class Scene implements Serializer<SceneFormat> {
    readonly paths: ObservableValue<Path<any>>[];
    readonly resolution: ObservableValue<number>;
    readonly alpha: ObservableValue<number>;
    readonly saturation: ObservableValue<number>;
    readonly brightness: ObservableValue<number>;
    serialize(): SceneFormat;
    deserialize(format: SceneFormat): Serializer<SceneFormat>;
    private static createPath;
}
export interface Path<FORMAT extends PathFormat> extends Serializer<FORMAT>, Terminable {
    eval(phase: number, offset: number): Point;
}
export declare type CirclePathFormat = {
    name: 'circle';
    frequency: number;
    radius: number;
};
export declare class CirclePath implements Path<CirclePathFormat> {
    private readonly terminator;
    readonly frequency: ObservableValue<number>;
    readonly radius: ObservableValue<number>;
    constructor(frequency?: number, radius?: number);
    eval(phase: number, offset: number): Point;
    deserialize(format: CirclePathFormat): Serializer<CirclePathFormat>;
    serialize(): CirclePathFormat;
    terminate(): void;
}
export declare type PolygonPathFormat = {
    name: 'polygon';
    n: number;
    frequency: number;
    radius: number;
    resolution: number;
};
export declare class PolygonPath implements Path<PolygonPathFormat> {
    private readonly terminator;
    readonly n: ObservableValue<number>;
    readonly frequency: ObservableValue<number>;
    readonly radius: ObservableValue<number>;
    readonly resolution: ObservableValue<number>;
    constructor(n?: number, frequency?: number, radius?: number, resolution?: number);
    eval(phase: number, offset: number): Point;
    deserialize(format: PolygonPathFormat): Serializer<PolygonPathFormat>;
    serialize(): PolygonPathFormat;
    terminate(): void;
}
