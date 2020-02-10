import Character from '@/lib/core/InteractiveObject/Character/Character';
import InteractiveObject from '@/lib/core/InteractiveObject/InteractiveObject';
import Point from '@/lib/core/utils/classes/Point';
import GameObject from '@/lib/core/RenderedObject/GameObject/GameObject';

declare global {
  interface Scene {
    addHero(arg0: Character): void,
    addObject(object: any, type: string): void
    start(): void,
    pause(): void,
    checkBeyondPosition(x: number, y: number, width: number, height: number): boolean,
    checkMoveCollisions(object: Character, xOffset: number, yOffset: number): boolean,
    checkDamageCollisions(object: Character): boolean,
    setBackground(background: ILayerCache): void,
    setForeground(foreground: ILayerCache): void,
    addObjects(objects: Map<string, IRenderedObject>): void,
  }
}

/**
 * @class Scene - The core of a game.
 */
export default class Scene {
  private _staticObjects: any[] = [];
  private _dynamicObjects: any[] = [];
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _hero: Character;
  private _paused: boolean;
  private background: ILayerCache;
  private foreground: ILayerCache;

  /**
   * @constructor Scene
   * @param {Element} element - a place where game will be rendering
   * @param {number} [width=500] - width of a game viewport
   * @param {number} [height=500] - height of a game viewport
   */
  constructor(element: Element, width?: number, height?: number) {
    this._canvas = document.createElement('canvas');
    this._canvas.width = width || 500;
    this._canvas.height = height || 500;
    element.append(this._canvas);
    this._ctx = this._canvas.getContext('2d');
  }

  setBackground(background: ILayerCache) {
    this.background = background;
  }
  setForeground(foreground: ILayerCache) {
    this.foreground = foreground;
  }
  /**
   * Method to add a main Hero to a game
   * @param {Character} hero - Instance of the Character class which would be the main hero of a game.
   */
  addHero(hero: Character) {
    if (hero instanceof Character) {
      this._hero = hero;
    } else throw new Error('Hero should be an instance of the Character class.');
  }

  /**
   *
   * @param object
   * @param {string} [type=static] - dynamic or static
   */
  // TODO fix types
  addObject(object: InteractiveObject, type?: string) {
    if (object && type === 'dynamic') this._dynamicObjects.push(object);
    if (object && type === 'static') this._staticObjects.push(object);
    else this._staticObjects.push(object);
  }

  addObjects(objects: Map<string, GameObject>) {
    // this value is the size of tiles from TileMap. Because place represent coords on the grid
    // for example - 1|2 means that real point is 1 * 16 | 2 * 16
    const defaultTileSize = 16;
    for (const [place, renderedObject] of objects.entries()) {
      // eslint-disable-next-line no-continue
      if ((renderedObject as any).isVirtual) continue;
      const [x, y] = Point.fromReverseString(place).toArray();
      const position = {
        x: x * defaultTileSize,
        y: y * defaultTileSize,
      };
      this.addObject(new InteractiveObject({ gameObject: renderedObject, position }), 'static');
    }
  }

  start() {
    this._paused = false;
    this._render();
  }

  pause() {
    this._paused = true;
  }

  checkBeyondPosition(x: number, y: number, width: number, height: number) {
    if (x <= 0) return false;
    if (x + width >= this._canvas.width) return false;
    if (y < 0) return false;
    return y + height < this._canvas.height;
  }

  /**
   * If object has collision with any static object returns true.
   * @param {Character} object
   * @param {number} xOffset - shift on the x axis
   * @param {number} yOffset - shift on the y axis
   * @returns {boolean}
   */
  checkMoveCollisions(object: Character, xOffset: number, yOffset: number) {
    return this._staticObjects.some(obj => this._detectCollision(object, obj, xOffset, yOffset));
  }

  /**
   * If object has collision with any dynamic object returns true.
   * It means that object receives a damage.
   * @param {Character} object
   * @returns {boolean}
   */
  checkDamageCollisions(object: Character) {
    return this._dynamicObjects.some(obj => this._detectCollision(object, obj));
  }

  _render() {
    if (this._paused) return;

    requestAnimationFrame(this._render.bind(this));
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._renderBackground();
    this._renderObjects();
    this._renderHero();
    this._renderForeground();
  }

  _renderBackground() {
    const { canvas, canvas: { width, height } } = this.background;
    this._ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
  }
  _renderForeground() {
    const { canvas, canvas: { width, height } } = this.foreground;
    this._ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
  }

  _renderObjects() {
    this._renderStaticObjects();
    this._dynamicObjects.forEach(dynamicObject => this._renderObject(dynamicObject));
  }

  _renderHero() {
    if (this._hero) this._renderObject(this._hero);
  }

  _renderInteractiveObject(object: InteractiveObject) {
    const { width, height } = object.sourceBoundingRect;
    const { x, y } = object.position;
    this._ctx.drawImage(
      object.render(),
      0,
      0,
      width,
      height,
      x,
      y,
      width,
      height,
    );
  }
  // TODO fix types
  _renderObject(object: any) {
    const { position, width, height } = object;
    this._ctx.drawImage(
      object.render(),
      0,
      0,
      width,
      height,
      position.x,
      position.y,
      width,
      height,
    );
  }

  _renderStaticObjects() {
    this._staticObjects.forEach(staticObject => this._renderInteractiveObject(staticObject));
  }

  // TODO fix types
  _detectCollision(
    a: Character | InteractiveObject,
    b: Character | InteractiveObject,
    xOffset: number = 0,
    yOffset: number = 0,
  ) {
    const { x, y } = a.position;
    const ax = x + xOffset;
    const ay = y + yOffset;
    const { x: bx, y: by } = b.position;
    const ax2 = ax + a.width;
    const ay2 = ay + a.height;
    const bx2 = bx + b.width;
    const by2 = by + b.height;

    if (bx < ax2 && ax < bx2 && by < ay2) { return ay < by2; }
    return false;
  }
}
