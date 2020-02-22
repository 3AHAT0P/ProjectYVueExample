import Canvas from '@/lib/core/Canvas/Canvas';
import {
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
} from '@/lib/core/Canvas/mixins/tileableCanvas/constants';
import { RenderedLayers } from '@/lib/core/Canvas/mixins/tileableCanvas/tileableCanvas';
import Character from '@/lib/core/InteractiveObject/Character/Character';
import InteractiveObject from '@/lib/core/InteractiveObject/StaticInteractiveObject';
import TileMap from '@/lib/core/TileMap/TileMap';
import { nextFrame } from '@/lib/core/utils/delayers';

const _onKeyDownHandler = Symbol('_onKeyDownHandler');
const _onKeyUpHandler = Symbol('_onKeyUpHandler');

type LAYER_INDEX = '-1' | '0' | '1';

const SIZE_MULTIPLIER = 1;

enum GameState {
  RUNNING,
  PAUSED,
}

const BROWSER_FRAME_RATE = 60;

/**
 * @class Scene - The core of a game.
 */
export default class Scene extends Canvas {
  private _tileMap: TileMap = null;
  private _layers: RenderedLayers = {
    [BACKGROUND_LAYER]: null,
    [ZERO_LAYER]: null,
    [FOREGROUND_LAYER]: null,
  };

  private _interactiveObjects: InteractiveObject[] = [];

  private _state: GameState = GameState.RUNNING;

  private _frameRate: number = BROWSER_FRAME_RATE;
  private _currentFrame: number = 0;

  private [_onKeyDownHandler](event: KeyboardEvent) {

  }

  private [_onKeyUpHandler](event: KeyboardEvent) {

  }

  private _renderLayer(layerIndex: LAYER_INDEX) {
    const layer = this._layers[layerIndex];
    this.drawImage(
      layer.source,
      layer.sourceBoundingRect.x, layer.sourceBoundingRect.y,
      layer.sourceBoundingRect.width, layer.sourceBoundingRect.height,
      0, 0,
      this.width * SIZE_MULTIPLIER, this.height * SIZE_MULTIPLIER,
    );
  }

  private _renderInteractiveObjects() {
    for (const interactiveObject of this._interactiveObjects) {
      this._renderInteractiveObject(interactiveObject);
    }
  }

  private _renderInteractiveObject(object: InteractiveObject) {
    const { position, renderedObject: { source, sourceBoundingRect } } = object;
    this.drawImage(
      source,
      sourceBoundingRect.x, sourceBoundingRect.y,
      sourceBoundingRect.width, sourceBoundingRect.height,
      position.x * SIZE_MULTIPLIER, position.y * SIZE_MULTIPLIER,
      sourceBoundingRect.width * SIZE_MULTIPLIER, sourceBoundingRect.height * SIZE_MULTIPLIER,
    );
  }

  private _focusCamera(focusedObject: InteractiveObject) {
    const virtualWidth = this.width * SIZE_MULTIPLIER;
    const virtualHeight = this.height * SIZE_MULTIPLIER;

    const cameraOffsetX = focusedObject.position.x / virtualWidth;
    const cameraOffsetY = focusedObject.position.y / virtualHeight;

    let translateX = -focusedObject.position.x - this.width / 3 * cameraOffsetX;
    let translateY = -focusedObject.position.y - this.height / 3 * cameraOffsetY;

    if (translateX < -(virtualWidth - this.width)) translateX = -(virtualWidth - this.width);
    if (translateX > 0) translateX = 0;

    if (translateY < -(virtualHeight - this.height)) translateY = -(virtualHeight - this.height);
    if (translateY > 0) translateY = 0;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(translateX, translateY);
  }

  private _tick(time: number) {
    this._currentFrame += 1;
    if (this._currentFrame >= BROWSER_FRAME_RATE / this._frameRate) {
      this._render(time);
      this._currentFrame = 0;
    }

    if (this._state !== GameState.RUNNING) return;
    nextFrame(this._tick);
  }

  protected _render(time: number) {
    this._applyImageSmoothing();
    this.clear();
    this._renderLayer(BACKGROUND_LAYER);
    this._renderLayer(ZERO_LAYER);
    this._renderInteractiveObjects();
    // this._focusCamera(this._hero);
    this._renderLayer(FOREGROUND_LAYER);
    this._afterRender();
  }

  protected _changeState(state: GameState) {
    this._state = state;
  }

  protected async _initListeners() {
    window.addEventListener('keydown', this[_onKeyDownHandler].bind(this), { passive: true });
    window.addEventListener('keyup', this[_onKeyUpHandler].bind(this), { passive: true });
  }

  /**
   * @constructor Scene
   */
  constructor() {
    super();

    this._tick = this._tick.bind(this);
  }

  public updateTileMap(tileMap: TileMap) {
    this._tileMap = tileMap;

    this._layers = this._tileMap.getNonInteractiveLayers();

    this.resize(this._tileMap.width, this._tileMap.height);

    this._interactiveObjects = this._tileMap.interactiveObjects.slice();
  }

  public play() {
    this._changeState(GameState.RUNNING);
    nextFrame(this._tick);
  }

  public pause() {
    this._changeState(GameState.PAUSED);
  }

  public inSceneBound(object: InteractiveObject) {
    const hitBoxes = object.hitBoxes;

    for (const hitBox of hitBoxes) {
      if (hitBox.left < 0 || hitBox.right > this.width || hitBox.top < 0 || hitBox.bottom > this.height) return false;
    }
    return true;
  }

  /**
   * If object has collision with any static object returns true.
   */
  public checkMoveCollisions(interactiveObject: InteractiveObject, offset: IPoint): IDistanceToObject {
    const hitBoxes = interactiveObject.hitBoxes.map((edges) => [edges, {
      left: edges.left + offset.x,
      top: edges.top + offset.y,
      right: edges.right + offset.x,
      bottom: edges.bottom + offset.y,
    }]);

    const canMove = {
      up: Infinity,
      down: Infinity,
      left: Infinity,
      right: Infinity,
    };

    for (const _interactiveObject of this._interactiveObjects) {
      for (const [edges, newEdges] of hitBoxes) {
        const relativePosition = _interactiveObject.getDistanceTo(edges, newEdges);
        if (relativePosition != null) {
          canMove.up = Math.min(canMove.up, relativePosition.up);
          canMove.down = Math.min(canMove.down, relativePosition.down);
          canMove.left = Math.min(canMove.left, relativePosition.left);
          canMove.right = Math.min(canMove.right, relativePosition.right);
        }
      }
    }
    return canMove;
  }
}
