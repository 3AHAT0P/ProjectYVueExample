import Flipbook from '@/lib/core/RenderedObject/Sprite/Flipbook';
import Sprite from '@/lib/core/RenderedObject/Sprite/Sprite';
import { ICollisionDetectorDelegate } from '@/lib/core/Scene/CollisionDetectorDelegate';

import InteractiveObject from '../InteractiveObject';
import AnimatedInteractiveObject, { AnimatedInteractiveObjectOptions } from '../AnimatedInteractiveObject';

const ERROR_HELP_TEXT = 'Use Character.create method to create character with a set of sprites';

type boolOrCallbackToBool = boolean | ((options: any) => boolean);

class NonDeterminedStateMachine {
  private _state: string = null;
  private _availableStates: Set<string> = new Set();
  private _availableTransitions: Map<string, Hash<boolOrCallbackToBool>> = new Map();
  private _stateHistory: string[] = [];
  private _historyLimit = 10;

  private _addToHistory(state: string) {
    this._stateHistory.push(state);
    if (this._stateHistory.length > this._historyLimit) this._stateHistory.shift();
  }

  constructor(states: Set<string>, transitions: Map<string, Hash<boolOrCallbackToBool>>) {
    this._availableStates = states;
    this._availableTransitions = transitions;
  }

  public getState(offset: number = 0): string {
    return this._stateHistory[this._stateHistory.length - 1 + offset];
  }

  public getTransition(prevState: string, nextState: string): boolOrCallbackToBool {
    if (prevState == null) return true;
    return this._availableTransitions.get(prevState)[nextState];
  }

  public makeTransition(nextState: string, options?: any): boolean {
    const canTransition = this.getTransition(this._state, nextState);
    if (canTransition instanceof Function) {
      if (canTransition(options)) {
        this._state = nextState;
        this._addToHistory(this._state);
        return true;
      }
    } else if (canTransition) {
      this._state = nextState;
      this._addToHistory(this._state);
      return true;
    }
    return false;
  }
}

const transitions: Hash<Hash<boolean>> = {
  IDLE: {
    MOVE: true,
    JUMP: true,
    FALL: true,
    ATTACK: true,
  },
  MOVE: {
    IDLE: true,
    JUMP: true,
    FALL: true,
    ATTACK: true,
  },
  JUMP: {
    IDLE: true,
    FALL: true,
    ATTACK: true,
  },
  FALL: {
    IDLE: true,
    ATTACK: true,
  },
  ATTACK: {
    IDLE: true,
    MOVE: true,
  },
};

const flipbooks: Hash<Flipbook> = {
  IDLE: null,
  MOVE: null,
  JUMP: null,
  FALL: null,
  ATTACK: null,
};

const controls: Hash<[string, Direction]> = {
  ArrowRight: ['MOVE', 'RIGHT'],
  ArrowLeft: ['MOVE', 'LEFT'],
  KeyD: ['MOVE', 'RIGHT'],
  KeyA: ['MOVE', 'LEFT'],
  ArrowUp: ['JUMP', null],
  KeyW: ['JUMP', null],
  Space: ['ATTACK', null],
};

interface CharacterOptions extends AnimatedInteractiveObjectOptions {
  collisionDetectorDelegate: ICollisionDetectorDelegate;
  transitions: Hash<Hash<boolean>>;
  controls: Hash<[string, Direction]>;
  flipbooks: Hash<Flipbook>;
}

const _onKeyDownHandler = Symbol('_onKeyDownHandler');
const _onKeyUpHandler = Symbol('_onKeyUpHandler');

const DEFAULT_CELL_SIZE = 16;

const MOVING_SPEED = DEFAULT_CELL_SIZE * 4; // Pixels per Second
const JUMPING_SPEED = DEFAULT_CELL_SIZE * 4; // Pixels per Second
const FALLING_SPEED = DEFAULT_CELL_SIZE * 2; // Pixels per Second

const SECOND = 1000.0;

export default class Character extends AnimatedInteractiveObject {
  private _collisionDetector: ICollisionDetectorDelegate = null;
  private _stateMachine: NonDeterminedStateMachine = null;

  private _direction: Direction = 'RIGHT';
  private _timeOfLastRender: number = null;

  private _flipbookMap: Map<string, Flipbook> = null;
  private _controlMap: Map<string, [string, Direction]> = null;
  private _heldControlMap: Map<string, boolean> = null;

  private _offsetError: IPoint = { x: 0, y: 0 };

  protected _currentFlipbook: Flipbook = null; // is current flipbook

  protected get _sprite(): Sprite { return this._currentFlipbook.currentSprite; }

  // @TODO: We do it wrong!
  private _getShift(): IPoint {
    const shift = {
      x: 0,
      y: 0,
    };
    if (this._heldControlMap.get('ArrowRight') || this._heldControlMap.get('KeyD')) shift.x = 1;
    if (this._heldControlMap.get('ArrowLeft') || this._heldControlMap.get('KeyA')) shift.x = -1;
    if (this._heldControlMap.get('ArrowUp') || this._heldControlMap.get('KeyW')) shift.y = -1;
    if (this._stateMachine.getState() === 'FALL' || this._stateMachine.getState() === 'IDLE') shift.y = 1;

    return shift;
  }

  // @TODO: We do it wrong!
  private _getOffset(time: number): IPoint {
    const dt = (time - this._timeOfLastRender) / SECOND;
    const shift = this._getShift();
    this._offsetError.x += shift.x * MOVING_SPEED * dt;
    this._offsetError.y += shift.y * JUMPING_SPEED * dt;
    const offset = {
      x: Math.trunc(this._offsetError.x),
      y: Math.trunc(this._offsetError.y),
    };
    this._offsetError.x -= offset.x;
    this._offsetError.y -= offset.y;
    return offset;
  }

  private _doAction(action: string, direction: Direction) {
    if (this._direction !== direction) this._direction = direction;
    if (this._stateMachine.makeTransition(action)) {
      if (this._currentFlipbook != null) this._currentFlipbook.stop();
      if (this._currentFlipbook != null) this._currentFlipbook.reset();
      this._currentFlipbook = this._flipbookMap.get(this._stateMachine.getState());
      if (this._direction === 'LEFT') this._currentFlipbook.mirror(true);
      else this._currentFlipbook.mirror(false);
    }
  }

  private _initListeners() {
    window.addEventListener('keydown', this[_onKeyDownHandler], { passive: true });
    window.addEventListener('keyup', this[_onKeyUpHandler], { passive: true });
  }

  private _unsubscribeListeners() {
    window.removeEventListener('keydown', this[_onKeyDownHandler]);
    window.removeEventListener('keyup', this[_onKeyUpHandler]);
  }

  private [_onKeyDownHandler](event: KeyboardEvent) {
    if (this._controlMap.has(event.code)) {
      this._heldControlMap.set(event.code, true);
      const [action, direction] = this._controlMap.get(event.code);
      if (direction == null) this._doAction(action, this._direction);
      else this._doAction(action, direction);
    }
  }

  private [_onKeyUpHandler](event: KeyboardEvent) {
    if (this._controlMap.has(event.code)) {
      this._heldControlMap.set(event.code, false);
      const [action, direction] = this._controlMap.get(event.code);
      if (action === this._stateMachine.getState()) this._doAction('IDLE', this._direction);
    }
  }

  constructor(options: CharacterOptions) {
    super(options);

    if (options.collisionDetectorDelegate == null) throw new Error('collisionDetectorDelegate is required option!');
    this._collisionDetector = options.collisionDetectorDelegate;

    if (options.transitions == null) throw new Error('transitions is required option!');
    this._stateMachine = new NonDeterminedStateMachine(
      new Set(Object.keys(options.transitions)),
      new Map(Object.entries(options.transitions)),
    );
    if (options.flipbooks == null) throw new Error('flipbooks is required option!');
    this._flipbookMap = new Map(Object.entries(options.flipbooks));

    if (options.controls == null) throw new Error('controls is required option!');
    this._controlMap = new Map(Object.entries(options.controls));
    this._heldControlMap = new Map(Object.keys(options.controls).map((item) => [item, false]));

    this._doAction('IDLE', 'RIGHT');

    this[_onKeyDownHandler] = this[_onKeyDownHandler].bind(this);
    this[_onKeyUpHandler] = this[_onKeyUpHandler].bind(this);
  }

  public destructor() {
    this._unsubscribeListeners();
  }

  public init() {
    this._initListeners();
  }

  /**
   * The main method for rendering a Character. Return current frame of a Character.
   * You can call it any time you want to rerender your scene.
   * Frame will change based on Flipbook settings which you have passed as a argument.
   */
  render(time: number) {
    const offset = this._getOffset(time);
    this._updatePosition(offset);
    this._timeOfLastRender = time;

    this._currentFlipbook.tick(time);

    // @FIXME:
    const diff = 44;

    return {
      position: this.position,
      center: { x: this._direction === 'LEFT' ? 128 - diff : diff, y: 0 },
      source: this._sprite.source,
      sourceBoundingRect: this._sprite.sourceBoundingRect,
    };
  }

  _updatePosition(offset: IPoint) {
    if (!this._collisionDetector.inSceneBound(this)) return;

    const canMove = this._collisionDetector.checkMoveCollisions(this, offset);

    // if (canMove.down !== 0 && this._stateMachine.getState() !== 'JUMP') this._doAction('FALL', this._direction);

    if (offset.x > 0) this._position.increaseCoordinate('X', Math.min(canMove.right, offset.x));
    if (offset.x < 0) this._position.increaseCoordinate('X', Math.max(-canMove.left, offset.x));
    if (offset.y > 0) this._position.increaseCoordinate('Y', Math.min(canMove.down, offset.y));
    if (offset.y < 0) this._position.increaseCoordinate('Y', Math.max(-canMove.up, offset.y));

    // @TODO:
    // if (this._hooks.onMove instanceof Function) this._hooks.onMove();

    // const isDamageReceived = this.mainSettings.hitBoxes.some(hitBox => {
    //   return this._coreElement.checkDamageCollisions(this.position, hitBox);
    // });

    // if (isDamageReceived) {
    //   if (this._hooks.onDamage instanceof Function) this._hooks.onDamage();
    // }
  }

  // @TODO:
  // _setOnChangeJumpFrame() {
  //   const onChangeHandler = (frameNumber: number, frameCount: number) => {
  //     const middleFrameNumber = Math.ceil(frameCount / 2);
  //     if (frameNumber > 1 && frameNumber < middleFrameNumber) this._jumpDirection = 'UP';
  //     if (frameNumber > middleFrameNumber && frameNumber < frameCount) {
  //       this._jumpDirection = 'DOWN';
  //     }
  //     if (frameNumber === frameCount) {
  //       this.actionType = this._prevActionType;
  //     }
  //   };
  //   const catchEndJumping = (frameNumber: number, frameCount: number) => {
  //     if (frameNumber === frameCount) {
  //       this._jumping = false;
  //       this.stop();
  //     }
  //   };
  //   this.jumpSettings.jumpLeftFlipbook.on('frameChange', onChangeHandler);
  //   this.jumpSettings.jumpLeftFlipbook.on('frameChange', catchEndJumping);
  //   this.jumpSettings.jumpRightFlipbook.on('frameChange', onChangeHandler);
  //   this.jumpSettings.jumpRightFlipbook.on('frameChange', catchEndJumping);
  // }
}
