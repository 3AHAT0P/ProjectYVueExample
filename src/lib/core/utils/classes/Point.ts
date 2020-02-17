const DELIMITER = '|';

type numOrStr = number | string;

declare global {
  interface IPoint {
    x: number;
    y: number;
  }
}

interface IPointConstructor {
  new(x: number, y: number): Point;
  fromString(value: string): Point;
  isEqual(x1: numOrStr, y1: numOrStr, x2: numOrStr, y2: numOrStr): boolean;
}

export default class Point implements IPoint {
  public static fromString(value: string) {
    const [x, y] = value.split(DELIMITER);
    return new this(Number(x), Number(y));
  }
  public static fromReverseString(value: string) {
    const [y, x] = value.split(DELIMITER);
    return new this(Number(x), Number(y));
  }

  public static isEqual(x1: numOrStr, y1: numOrStr, x2: numOrStr, y2: numOrStr): boolean {
    return Number(x1) === Number(x2) && Number(y1) === Number(y2);
  }

  private _x: number = 0;
  private _y: number = 0;

  public get x() { return this._x; }
  public get y() { return this._y; }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public updateCoordinates(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public toString() {
    return `${this.x}${DELIMITER}${this.y}`;
  }

  public toReverseString() {
    return `${this.y}${DELIMITER}${this.x}`;
  }

  public toArray(): [number, number] {
    return [this.x, this.y];
  }

  public toObject() {
    return { x: this.x, y: this.y };
  }

  public isEqualTo(x: numOrStr, y: numOrStr): boolean {
    return (this.constructor as IPointConstructor).isEqual(this.x, this.y, x, y);
  }

  public isEqualToPoint(point: Point): boolean {
    return (this.constructor as IPointConstructor).isEqual(this.x, this.y, point.x, point.y);
  }

  public add(x: numOrStr, y: numOrStr): this {
    this._x += Number(x);
    this._y += Number(y);

    return this;
  }
}
