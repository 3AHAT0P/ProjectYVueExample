<template>
  <div :class="blockName">
    Welcome to the game!!!
    <button @click="scene.start()">Start Game</button>
    <button @click="scene.pause()">Pause Game</button>
    <div ref="sceneWrapper"></div>
    <canvas key="canvas" :class="blockName | bemElement('scene')" ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue } from 'vue-property-decorator';

import {
  LAYER_INDEX,
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  SYSTEM_UI_LAYER,
} from '@/lib/core/Canvas/mixins/tileableCanvas/constants';
import Scene from '@/lib/core/Scene/Scene';
import TileMap from '@/lib/core/TileMap/TileMap';
import Character from '@/lib/core/InteractiveObject/Character/Character';
import Flipbook from '@/lib/core/RenderedObject/Sprite/Flipbook';
import { uuid } from '@/lib/core/utils';

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class Game extends Vue {
  private blockName: string = 'game';
  private scene: Scene = null;

  private metadataUrl: string = `${BASE_URL}tilemaps/tilemap.json`;
  private loading: boolean;
  private mainTileMap: TileMap;

  mounted() {
    this.init();
    this.loading = true;
  }

  beforeDestroy() {
    this.scene.pause();
  }

  async init() {
    const tileMap = document.createElement('canvas');
    this.mainTileMap = await TileMap.create({
      el: tileMap,
      metadataUrl: this.metadataUrl,
    });

    const interactiveObjects = this.mainTileMap.interactiveObjects;

    this.scene = await Scene.create({
      el: this.$refs.canvas as HTMLCanvasElement,
    });
    this.scene.updateTileMap(this.mainTileMap);

    const sourceBoundingRect: IBoundingRect = {
      x: 0,
      y: 0,
      width: 128,
      height: 128,
    };

    const hitBoxes = [
      {
        id: 0,
        from: {
          x: 27,
          y: 57,
        },
        to: {
          x: 60,
          y: 108,
        },
        options: {
          color: 168,
        },
      },
    ];

    const center = {
      x: 43.5,
      y: 0,
    };

    const name = 'KnightSprite';
    const version = '0.1.0';

    const moveFlipbook = await Flipbook.create({
      spriteMetaList: [
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run1.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run2.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run3.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run4.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run5.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run6.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run7.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Run/run8.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
      ],
      frameDuration: 128,
    });

    const jumpFlipbook = await Flipbook.create({
      spriteMetaList: [
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump1.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump2.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump3.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
      ],
      frameDuration: 128,
      repeat: false,
    });

    const attackFlipbook = await Flipbook.create({
      spriteMetaList: [
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Attack/attack0.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Attack/attack1.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Attack/attack2.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Attack/attack4.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
      ],
      frameDuration: 128,
    });

    const fallFlipbook = await Flipbook.create({
      spriteMetaList: [
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump4.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump5.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump6.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Jump/jump7.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
      ],
      frameDuration: 128,
      waitBefore: 2500,
      waitAfter: 2500,
      repeat: false,
    });

    const idleFlipbook = await Flipbook.create({
      spriteMetaList: [
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle1.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle2.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle3.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle4.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle5.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle6.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle7.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle8.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle9.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle10.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle11.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
        {
          id: uuid(),
          sourceURL: './sources/PNG/Knight/Idle/idle12.png',
          sourceBoundingRect,
          hitBoxes,
          name,
          version,
          center,
        },
      ],
      frameDuration: 128,
      waitBefore: 2500,
      waitAfter: 2500,
    });

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
      IDLE: idleFlipbook,
      MOVE: moveFlipbook,
      JUMP: jumpFlipbook,
      FALL: fallFlipbook,
      ATTACK: attackFlipbook,
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

    const player = new Character({
      position: { x: this.scene.width - 300, y: this.scene.height - 274 },
      collisionDetectorDelegate: this.scene,
      transitions,
      flipbooks,
      controls,
    });

    player.init();

    this.scene.addCharacter(player);
    this.scene.play();
    this.loading = false;
  }
}
</script>
