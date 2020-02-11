<template>
  <div :class="blockName">
    Welcome to the game!!!
    <button @click="scene.start()">Start Game</button>
    <button @click="scene.pause()">Pause Game</button>
    <div ref="sceneWrapper"></div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Vue } from 'vue-property-decorator';

import Scene from '@/lib/core/Scene/Scene';
import TileMap from '@/lib/core/TileMap/TileMap';
import GameObject from '@/lib/core/RenderedObject/GameObject/GameObject';
import Character from '@/lib/core/InteractiveObject/Character/Character';

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
    const { width, height } = this.mainTileMap._el;
    const background = this.mainTileMap.getBackground();
    const foreground = this.mainTileMap.getForeground();
    const objects = this.mainTileMap.getObjects();
    const gameObjects: Map<string, GameObject> = new Map(
      [...objects.entries()].filter((pair: any[]) => (pair[1] instanceof GameObject)),
    );
    this.scene = new Scene(this.$el, width, height);
    const player = await Character.create({
      coreElement: this.scene,
      position: { x: width - 200, y: height - 270 },
      mainSettings: {
        mainFlipbook: './sources/PNG/Knight/knight.png',
        hitBoxes: [{
          id: 0, from: { x: 24, y: 56 }, to: { x: 72, y: 112 }, options: { color: 0 },
        }],
        speed: 300,
      },
      moveSettings: {
        moveFlipbook: [
          './sources/PNG/Knight/Run/run1.png',
          './sources/PNG/Knight/Run/run2.png',
          './sources/PNG/Knight/Run/run3.png',
          './sources/PNG/Knight/Run/run4.png',
          './sources/PNG/Knight/Run/run5.png',
          './sources/PNG/Knight/Run/run6.png',
          './sources/PNG/Knight/Run/run7.png',
          './sources/PNG/Knight/Run/run8.png',
        ],
      },
      jumpSettings: {
        jumpFlipbook: [
          './sources/PNG/Knight/Jump/jump1.png',
          './sources/PNG/Knight/Jump/jump2.png',
          './sources/PNG/Knight/Jump/jump3.png',
          './sources/PNG/Knight/Jump/jump4.png',
          './sources/PNG/Knight/Jump/jump5.png',
          './sources/PNG/Knight/Jump/jump6.png',
          './sources/PNG/Knight/Jump/jump7.png',
        ],
      },
      attackSettings: {
        attackFlipbook: [
          './sources/PNG/Knight/Attack/attack0.png',
          './sources/PNG/Knight/Attack/attack1.png',
          './sources/PNG/Knight/Attack/attack2.png',
          './sources/PNG/Knight/Attack/attack4.png',
        ],
      },
    });
    player.showHitBoxes = true;

    this.scene.addHero(player);
    this.scene.setBackground(background);
    this.scene.setForeground(foreground);
    this.scene.addObjects(gameObjects);
    this.scene.start();
    this.loading = false;
  }
}
</script>
