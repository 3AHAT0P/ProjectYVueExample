import Flipbook from '@/lib/core/RenderedObject/Flipbook';

declare global {
  interface IHooks {
    onStop(): void,

    onMove(): void,

    onDamage(): void,
  }

  interface IMainSettings {
    mainFlipbook: Flipbook | Sprite;
    mainRightFlipbook: Flipbook,
    mainLeftFlipbook: Flipbook,

    checkPosition(): boolean,

    speed: number,
  }

  interface IMainOptions {
    mainFlipbook: string | string[];

    checkPosition?(): boolean,

    speed: number,
  }

  interface IMoveSettings {
    moveRightFlipbook: Flipbook,
    moveLeftFlipbook: Flipbook,
    moveRightCode?: string,
    moveLeftCode?: string,
    alternativeMoveRightCode?: string,
    alternativeMoveLeftCode?: string,
  }

  interface IMoveOptions {
    moveFlipbook: string[],
    moveRightCode?: string,
    moveLeftCode?: string,
    alternativeMoveRightCode?: string,
    alternativeMoveLeftCode?: string,
    moveFlipbookMeta?: any,
  }

  interface IJumpSettings {
    jumpRightFlipbook: Flipbook,
    jumpLeftFlipbook: Flipbook,
    jumpCode?: string,
    alternativeJumpCode?: string,
  }

  interface IJumpOptions {
    jumpFlipbook: string[],
    jumpCode?: string,
    alternativeJumpCode?: string,
    jumpFlipbookMeta?: any,
  }

  interface IAttackSettings {
    attackRightFlipbook: Flipbook,
    attackLeftFlipbook: Flipbook,
    attackCode?: string,
  }

  interface IAttackOptions {
    attackFlipbook: string[],
    attackCode?: string,
    attackFlipbookMeta?: any,
  }

  interface ICharacterCreate {
    coreElement: Scene,
    position: IPoint,
    mainSettings: IMainOptions,
    moveSettings: IMoveOptions,
    jumpSettings: IJumpOptions,
    attackSettings: IAttackOptions,
  }

  interface ICharacterConstructor {
    coreElement: Scene,
    position: IPoint,
    mainSettings: IMainSettings,
    moveSettings: IMoveSettings,
    jumpSettings: IJumpSettings,
    attackSettings: IAttackSettings,
  }
}
