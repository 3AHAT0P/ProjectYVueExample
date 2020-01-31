import Flipbook from '../Flipbook';
import Sprite from '../Sprite';

const ERROR_HELP_TEXT = 'Use Character.create method to create character with a set of sprites';
declare global {
  interface Character {
// TODO fill Character interface and refactor
  }
}

export default class Character {
  private _coreElement: Scene = null;

  private _prevActionType = 'STOP';
  private _currentActionType = 'STOP';
  private _direction = 'RIGHT';
  private _hooks: IHooks = {
    onStop: null,
    onMove: null,
    onDamage: null,
  };
  private readonly _actionHandlerHash: any;
  private _moving: boolean;
  private _jumping: boolean;
  private _lastRenderTime: number;
  private _offscreenCanvas: HTMLCanvasElement;
  private _renderer: CanvasRenderingContext2D;

  actionType: string;

  flipbook: Flipbook = null;
  mainSettings: IMainSettings = {
    mainFlipbook: null,
    mainRightFlipbook: null,
    mainLeftFlipbook: null,
    /**
     * The function should return a boolean value which indicates can a Character move or not.
     *
     * @callback checkPosition
     * @returns {boolean}
     */
    checkPosition: null,
    speed: null,
  };

  moveSettings: IMoveSettings = {
    moveRightFlipbook: null,
    moveLeftFlipbook: null,
    moveRightCode: 'ArrowRight',
    moveLeftCode: 'ArrowLeft',
    alternativeMoveRightCode: 'KeyD',
    alternativeMoveLeftCode: 'KeyA',
  };

  jumpSettings: IJumpSettings = {
    jumpRightFlipbook: null,
    jumpLeftFlipbook: null,
    jumpCode: 'ArrowUp',
    alternativeJumpCode: 'KeyW',
  };

  attackSettings: IAttackSettings = {
    attackRightFlipbook: null,
    attackLeftFlipbook: null,
    attackCode: 'Space',
  };

  position = {
    x: 0,
    y: 0,
  };

  /**
   * @constructs The main method to create a character
   * @param {Scene} coreElement - canvas on which Character will be rendered
   * @param {Object} position - initial Character position
   * @param {number} position.x - canvas coordinates
   * @param {number} position.y - canvas coordinates
   * @param {Object} mainSettings - main Character settings
   * @param {string | string[]} mainSettings.mainFlipbook - url or array of url
   * @param {checkPosition} mainSettings.checkPosition - function to check any collisions and possibility to move.
   * @param {number} mainSettings.speed - speed of a Character in px per second
   * @param {Object} moveSettings - settings for move action
   * @param {string[]} moveSettings.moveFlipbook - array of url
   * @param {string} moveSettings.moveRightCode - main right move action code
   * @param {string} moveSettings.moveLeftCode - main left move action code
   * @param {string} moveSettings.alternativeMoveRightCode - alternative right move action code
   * @param {string} moveSettings.alternativeMoveLeftCode - alternative left move action code
   * @param {Object} jumpSettings - settings for jump action
   * @param {string[]} jumpSettings.jumpFlipbook - array of url
   * @param {string} jumpSettings.jumpCode - main jump action code
   * @param {string} jumpSettings.alternativeJumpCode - alternative jump action code
   * @param {Object} attackSettings - settings for attack actions
   * @param {string[]} attackSettings.attackFlipbook - array of url
   * @param {string} attackSettings.attackCode - main attack action code
   * @returns {Promise<Character>}
   */
  static async create({
    coreElement,
    position,
    mainSettings,
    moveSettings,
    jumpSettings,
    attackSettings,
  }: ICharacterCreate) {
    const { moveFlipbook, moveFlipbookMeta, ...restMoveSettings } = moveSettings;
    const { jumpFlipbook, jumpFlipbookMeta } = jumpSettings;
    const { attackFlipbook, attackFlipbookMeta } = attackSettings;

    const characterSettings: ICharacterConstructor = {
      coreElement,
      position,
      mainSettings: {
        mainRightFlipbook: null,
        mainLeftFlipbook: null,
        mainFlipbook: null,
        checkPosition(): boolean {
          return true;
        },
        speed: null,
      },
      moveSettings: {
        ...restMoveSettings,
        moveRightFlipbook: null,
        moveLeftFlipbook: null,
      },
      jumpSettings: {
        ...jumpSettings,
        jumpLeftFlipbook: null,
        jumpRightFlipbook: null,
      },
      attackSettings: {
        ...attackSettings,
        attackLeftFlipbook: null,
        attackRightFlipbook: null,
      },
    };
    if (typeof mainSettings.mainFlipbook === 'string') {
      characterSettings.mainSettings.mainRightFlipbook = await Flipbook.create(
        [mainSettings.mainFlipbook],
      );
    }
    if (typeof mainSettings.mainFlipbook === 'string') {
      characterSettings.mainSettings.mainLeftFlipbook = await Flipbook.create(
        [mainSettings.mainFlipbook], { mirror: true },
      );
    }
    if (mainSettings.mainFlipbook instanceof Array) {
      characterSettings.mainSettings.mainRightFlipbook = await Flipbook.create(mainSettings.mainFlipbook);
    }
    if (mainSettings.mainFlipbook instanceof Array) {
      characterSettings.mainSettings.mainLeftFlipbook = await Flipbook.create(
        mainSettings.mainFlipbook, { mirror: true },
      );
    }
    if (moveFlipbook instanceof Array) {
      characterSettings.moveSettings.moveRightFlipbook = await Flipbook.create(moveFlipbook, moveFlipbookMeta);
      characterSettings.moveSettings.moveLeftFlipbook = await Flipbook.create(moveFlipbook, {
        ...moveFlipbookMeta,
        mirror: true,
      });
    }
    if (jumpFlipbook instanceof Array) {
      characterSettings.jumpSettings.jumpRightFlipbook = await Flipbook.create(jumpFlipbook, jumpFlipbookMeta);
      characterSettings.jumpSettings.jumpLeftFlipbook = await Flipbook.create(jumpFlipbook, {
        ...jumpFlipbookMeta,
        mirror: true,
      });
    }
    if (attackFlipbook instanceof Array) {
      characterSettings.attackSettings.attackRightFlipbook = await Flipbook.create(attackFlipbook, attackFlipbookMeta);
      characterSettings.attackSettings.attackLeftFlipbook = await Flipbook.create(attackFlipbook, {
        ...attackFlipbookMeta,
        mirror: true,
      });
    }

    return new Character(characterSettings);
  }

  /**
   * @param {Scene} coreElement - canvas on which Character will be rendered
   * @param {Object} position - initial Character position
   * @param {number} position.x - canvas coordinates
   * @param {number} position.y - canvas coordinates
   * @param {Object} mainSettings - main Character settings
   * @param {Flipbook} mainSettings.mainRightFlipbook
   * @param {Flipbook} mainSettings.mainLeftFlipbook
   * @param {checkPosition} mainSettings.checkPosition - function to check any collisions and possibility to move.
   * @param {number} mainSettings.speed - speed of a Character in px per second
   * @param {Object} moveSettings - settings for move action
   * @param {Flipbook} moveSettings.moveRightFlipbook
   * @param {Flipbook} moveSettings.moveLeftFlipbook
   * @param {string} moveSettings.moveRightCode - main right move action code
   * @param {string} moveSettings.moveLeftCode - main left move action code
   * @param {string} moveSettings.alternativeMoveRightCode - alternative right move action code
   * @param {string} moveSettings.alternativeMoveLeftCode - alternative left move action code
   * @param {Object} jumpSettings - settings for jump action
   * @param {Flipbook} jumpSettings.jumpRightFlipbook
   * @param {Flipbook} jumpSettings.jumpLeftFlipbook
   * @param {string} jumpSettings.jumpCode - main jump action code
   * @param {string} jumpSettings.alternativeJumpCode - alternative jump action code
   * @param {Object} attackSettings - settings for attack actions
   * @param {Flipbook} attackSettings.attackRightFlipbook
   * @param {Flipbook} attackSettings.attackLeftFlipbook
   * @param {string} attackSettings.attackCode - main attack action code
   * @returns {Character}
   */
  constructor({
    coreElement,
    position,
    mainSettings,
    moveSettings: {
      moveRightFlipbook,
      moveLeftFlipbook,
      moveRightCode,
      moveLeftCode,
      alternativeMoveRightCode,
      alternativeMoveLeftCode,
    },
    jumpSettings: {
      jumpRightFlipbook,
      jumpLeftFlipbook,
      jumpCode,
      alternativeJumpCode,
    },
    attackSettings: {
      attackRightFlipbook,
      attackLeftFlipbook,
      attackCode,
    },
  }: ICharacterConstructor) {
    if (coreElement) this._coreElement = coreElement;
    else throw new Error('coreElement is required for Character!');

    this._validateFlipbooks(mainSettings.mainRightFlipbook, moveRightFlipbook, jumpRightFlipbook, attackRightFlipbook);

    this.mainSettings = mainSettings;
    this.mainSettings.checkPosition = mainSettings.checkPosition || (() => true);
    this.moveSettings.moveRightFlipbook = moveRightFlipbook;
    this.moveSettings.moveLeftFlipbook = moveLeftFlipbook;
    this.jumpSettings.jumpRightFlipbook = jumpRightFlipbook;
    this.jumpSettings.jumpLeftFlipbook = jumpLeftFlipbook;
    this.attackSettings.attackRightFlipbook = attackRightFlipbook;
    this.attackSettings.attackLeftFlipbook = attackLeftFlipbook;
    // move codes override
    if (moveRightCode) this.moveSettings.moveRightCode = moveRightCode;
    if (moveLeftCode) this.moveSettings.moveLeftCode = moveLeftCode;
    if (alternativeMoveRightCode) this.moveSettings.alternativeMoveRightCode = alternativeMoveRightCode;
    if (alternativeMoveLeftCode) this.moveSettings.alternativeMoveLeftCode = alternativeMoveLeftCode;
    // jump codes override
    if (jumpCode) this.jumpSettings.jumpCode = jumpCode;
    if (alternativeJumpCode) this.jumpSettings.alternativeJumpCode = alternativeJumpCode;
    // attack code override
    if (attackCode) this.attackSettings.attackCode = attackCode;

    // initial position overrides
    if (typeof position.x === 'number') this.position.x = position.x;
    if (typeof position.y === 'number') this.position.y = position.y;

    this._actionHandlerHash = {
      [this.moveSettings.moveLeftCode]: this.moveLeft.bind(this),
      [this.moveSettings.alternativeMoveLeftCode]: this.moveLeft.bind(this),
      [this.moveSettings.moveRightCode]: this.moveRight.bind(this),
      [this.moveSettings.alternativeMoveRightCode]: this.moveRight.bind(this),
      [this.jumpSettings.jumpCode]: this.jump.bind(this),
      [this.jumpSettings.alternativeJumpCode]: this.jump.bind(this),
      [this.attackSettings.attackCode]: this.attack.bind(this),
    } as any;
    this._createOffscreenCanvas();
    this._initListeners();
    this._setOnChangeJumpFrame();
    this.stop();
  }

  get currentActionType() {
    return this._currentActionType;
  }

  set currentActionType(actionName) {
    if (this.currentActionType !== actionName) this._currentActionType = actionName;
    if (actionName === 'STOP') {
      if (this._hooks.onStop instanceof Function) this._hooks.onStop();
    }
  }

  moveRight() {
    if (this._moving && this._direction === 'RIGHT') return;
    this.currentActionType = 'MOVE';
    this._direction = 'RIGHT';
    this._moving = true;
    this.flipbook = this.moveSettings.moveRightFlipbook;
    this.flipbook.start();
  }
  moveLeft() {
    if (this._moving && this._direction === 'LEFT') return;
    this.currentActionType = 'MOVE';
    this._direction = 'LEFT';
    this._moving = true;
    this.flipbook = this.moveSettings.moveLeftFlipbook;
    this.flipbook.start();
  }
  jump() {
    if (this._jumping) return;
    this._jumping = true;
    this.currentActionType = 'JUMP';
    this.flipbook = this._direction === 'RIGHT'
      ? this.jumpSettings.jumpRightFlipbook : this.jumpSettings.jumpLeftFlipbook;
    this.flipbook.start();
  }
  stop() {
    if (this._jumping) return;
    if (!this._jumping && this._moving) {
      this._stopAllFlipbooks();
      if (this._direction === 'RIGHT') this.moveRight();
      if (this._direction === 'LEFT') this.moveLeft();
    } else {
      this.currentActionType = 'STOP';
      this._stopAllFlipbooks();
      this.flipbook = this._direction === 'RIGHT'
        ? this.mainSettings.mainRightFlipbook : this.mainSettings.mainLeftFlipbook;
      if (this.flipbook instanceof Flipbook) this.flipbook.start();
    }
  }
  attack() {
    if (this.currentActionType === 'ATTACK') return;
    this.currentActionType = 'ATTACK';
    this.flipbook = this._direction === 'RIGHT'
      ? this.attackSettings.attackRightFlipbook : this.attackSettings.attackLeftFlipbook;
    this.flipbook.start();
  }

  /**
   * The main method for rendering a Character. Return current frame of a Character.
   * You can call it any time you want to rerender your scene.
   * Frame will change based on Flipbook settings which you have passed as a argument.
   * @returns {Image | HTMLCanvasElement}
   */
  render() {
    const offset = this._getOffset();
    if (this._moving && this._direction === 'RIGHT') this._changePosition(offset);
    if (this._moving && this._direction === 'LEFT') this._changePosition(-offset);

    this._lastRenderTime = Date.now();
    return this.flipbook.currentSprite;
  }

  /**
   * You have to call destroy method if a Character will disappear to prevent memory leaks
   */
  destroy() {
    window.removeEventListener('keydown', this._keydownEventHandler);
    window.removeEventListener('keyup', this._keyupEventHandler);
  }

  /**
   * This method is used to add hooks for a character.
   * Available hooks - onMove, onStop, onDamage
   * @param hook
   * @param handler
   */
  on(hook: string, handler: Function) {
    const isValidHook = ['onMove', 'onStop', 'onDamage'].includes(hook);
    const isValidHandler = handler instanceof Function;
    if (isValidHook && isValidHandler) {
      // @ts-ignore
      this._hooks[hook] = handler;
    }
  }

  _validateFlipbooks(mainFlipbook: any, moveFlipbook: any, jumpFlipbook: any, attackFlipbook: any) {
    const isMainFlipbookValid = mainFlipbook != null
      && (mainFlipbook instanceof Sprite || mainFlipbook instanceof Flipbook);
    const isMoveFlipbookValid = moveFlipbook != null && moveFlipbook instanceof Flipbook;
    const isJumpFlipbookValid = jumpFlipbook != null && jumpFlipbook instanceof Flipbook;
    const isAttackFlipbookValid = attackFlipbook != null && attackFlipbook instanceof Flipbook;

    const invalidFlipbooks = [];

    if (!isMainFlipbookValid) invalidFlipbooks.push('mainFlipbook');
    if (!isMoveFlipbookValid) invalidFlipbooks.push('moveFlipbook');
    if (!isJumpFlipbookValid) invalidFlipbooks.push('jumpFlipbook');
    if (!isAttackFlipbookValid) invalidFlipbooks.push('attackFlipbook');

    if (invalidFlipbooks.length) throw new Error(`${invalidFlipbooks} are required! ${ERROR_HELP_TEXT}`);
  }

  _createOffscreenCanvas() {
    this._offscreenCanvas = document.createElement('canvas');
    this._offscreenCanvas.width = this.mainSettings.mainFlipbook.width;
    this._offscreenCanvas.height = this.mainSettings.mainFlipbook.height;
    this._renderer = this._offscreenCanvas.getContext('2d');
    this._renderer.imageSmoothingEnabled = false;
  }

  _initListeners() {
    window.addEventListener('keydown', this._keydownEventHandler.bind(this), { passive: true });
    window.addEventListener('keyup', this._keyupEventHandler.bind(this), { passive: true });
  }

  _keydownEventHandler(event: KeyboardEvent) {
    if (Object.keys(this._actionHandlerHash).includes(event.code)) this._actionHandlerHash[event.code](event);
  }

  _keyupEventHandler(event: KeyboardEvent) {
    if ([this.jumpSettings.jumpCode, this.jumpSettings.alternativeJumpCode].includes(event.code)) return;
    if ([
      this.moveSettings.moveRightCode,
      this.moveSettings.alternativeMoveRightCode,
      this.moveSettings.moveLeftCode,
      this.moveSettings.alternativeMoveLeftCode,
    ].includes(event.code)) {
      this._moving = false;
    }
    this.stop();
  }

  get width() {
    return this.flipbook.currentSprite.width;
  }

  get height() {
    return this.flipbook.currentSprite.height;
  }

  _changePosition(dx = 0, dy = 0) {
    const isWithin = this._coreElement.checkBeyondPosition(
      this.position.x + dx, this.position.y + dy, this.width, this.height,
    );
    const hasMoveCollisions = this._coreElement.checkMoveCollisions(this);
    if (isWithin && !hasMoveCollisions) {
      this.position.x += dx;
      this.position.y += dy;
      if (this._hooks.onMove instanceof Function) this._hooks.onMove();
    }
    const isDamageReceived = this._coreElement.checkDamageCollisions(this);
    if (isDamageReceived) {
      if (this._hooks.onDamage instanceof Function) this._hooks.onDamage();
    }
  }

  _setOnChangeJumpFrame() {
    const onChangeHandler = (frameNumber: number, frameCount: number) => {
      const middleFrameNumber = Math.ceil(frameCount / 2);
      if (frameNumber > 1 && frameNumber < middleFrameNumber) this._changePosition(0, -8);
      if (frameNumber > middleFrameNumber && frameNumber < frameCount) this._changePosition(0, 8);
      if (frameNumber === frameCount) {
        this.actionType = this._prevActionType;
      }
    };
    const catchEndJumping = (frameNumber: number, frameCount: number) => {
      if (frameNumber === frameCount) {
        this._jumping = false;
        this.stop();
      }
    };
    this.jumpSettings.jumpLeftFlipbook.on('frameChange', onChangeHandler);
    this.jumpSettings.jumpLeftFlipbook.on('frameChange', catchEndJumping);
    this.jumpSettings.jumpRightFlipbook.on('frameChange', onChangeHandler);
    this.jumpSettings.jumpRightFlipbook.on('frameChange', catchEndJumping);
  }

  _getOffset() {
    const timeChange = Date.now() - this._lastRenderTime;
    const dt = timeChange / 1000.0;
    return this.mainSettings.speed * dt;
  }

  _stopAllFlipbooks() {
    this._jumping = false;
    this._moving = false;
    this.mainSettings.mainLeftFlipbook.stop();
    this.mainSettings.mainRightFlipbook.stop();
    this.jumpSettings.jumpRightFlipbook.stop();
    this.jumpSettings.jumpLeftFlipbook.stop();
    this.moveSettings.moveRightFlipbook.stop();
    this.moveSettings.moveLeftFlipbook.stop();
    this.attackSettings.attackRightFlipbook.stop();
    this.attackSettings.attackLeftFlipbook.stop();
  }
}
