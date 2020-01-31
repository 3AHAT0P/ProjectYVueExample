<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('sidebar')">
      <div>
        Load from LS:
        <div v-for="gameObject in savedGameObjects" :key="gameObject[1].name">
          {{gameObject[0]}}: <button @click="loadFromLS(gameObject)">Load</button>
        </div>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <button @click="clear">Clear</button>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        Or load By URL
        <label><span>Metadata file URL: </span><input type="text" v-model="metadataUrl"></label>
        <button @click="load">Load</button>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <label><span>Name: </span><input type="text" v-model="name"></label>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <span>Hitboxes (to create a new one, draw it): </span>
        <br>
        <label v-for="hitBox in hitBoxes" :key="hitBox.id">
          <span>{{hitBox.id}}: </span>
          <br>
          x1 <input
            v-if="hitBox.from"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.from.x"
            @change="rerender"
          >
          y1 <input
            v-if="hitBox.from"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.from.y"
            @change="rerender"
          >
          <br>
          x2 <input
            v-if="hitBox.to"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.to.x"
            @change="rerender"
          >
          y2 <input
            v-if="hitBox.to"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.to.y"
            @change="rerender"
          >
          <br>
        </label>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <button @click="saveToLS">Save to LocalStorage</button>
    </div>
    <div :class="blockName | bemElement('body')">
      <canvas key="canvas" :class="blockName | bemElement('game-object')" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  Watch,
} from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';

import GameObjectCanvas from '@/lib/core/GameObject/Canvas';

import Tile from '@/lib/core/utils/classes/Tile';
import Point from '@/lib/core/utils/classes/Point';
import getTilesRectCount from '@/lib/core/utils/getTilesRectSizes';
import drawImageFromMap from '@/lib/core/utils/drawImageFromMap';

import { localStorageEntries } from '@/utils';

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class GameObjectEditor extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => (new Map()) }) private tiles!: Map<string, Tile>;

  private blockName: string = 'game-object-editor';

  private gameObjectCanvas: GameObjectCanvas = null;

  private metadataUrl: string = `${BASE_URL}game-objects/player-mage.json`;

  private tileMapX: number = 128;
  private tileMapY: number = 128;

  private hitBoxes: any[] = [];
  private savedGameObjects: any[] = [];

  private name: string = '';

  constructor(...args: any[]) {
    super(...args);

    this.onHitBoxesUpdated = this.onHitBoxesUpdated.bind(this);
  }

  mounted() {
    this.init();
    this.getListGameObjects();
  }

  async init() {
    this.gameObjectCanvas = await GameObjectCanvas.create({
      el: this.$refs.canvas,
      metadataUrl: this.metadataUrl,
      size: {
        width: this.tileMapX,
        height: this.tileMapY,
      },
    });

    this.tileMapX = this.gameObjectCanvas.width;
    this.tileMapY = this.gameObjectCanvas.height;
    this.name = this.gameObjectCanvas.gameObjectName;

    this.gameObjectCanvas.addEventListener(':hitBoxsUpdated', this.onHitBoxesUpdated);
  }

  @Watch('name')
  private onNameChange(name: string) {
    this.gameObjectCanvas.gameObjectName = name;
  }

  @Watch('tiles')
  private onTilesChange(tiles: Map<string, Tile>) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { xCount, yCount } = getTilesRectCount(tiles);
    const tileWidth = tiles.get('0|0').sourceBoundingRect.height;
    const tileHeight = tiles.get('0|0').sourceBoundingRect.width;
    canvas.width = xCount * tileWidth;
    canvas.height = yCount * tileHeight;
    ctx.imageSmoothingEnabled = false;
    for (const [place, tile] of tiles.entries()) {
      const [x, y] = Point.fromReverseString(place).toArray();
      const tileBoundingRect = tile.sourceBoundingRect;
      ctx.drawImage(
        tile.source,
        tileBoundingRect.x,
        tileBoundingRect.y,
        tileBoundingRect.width,
        tileBoundingRect.height,
        x * tileWidth,
        y * tileHeight,
        tileWidth,
        tileHeight,
      );
    }
    this.gameObjectCanvas.updateCache(canvas);

    this.gameObjectCanvas.dispatchEvent(new Event(':renderRequest'));
  }

  private onHitBoxesUpdated({ hitBoxes }: any) {
    this.hitBoxes = hitBoxes;
  }

  private rerender() {
    this.gameObjectCanvas.dispatchEvent(new Event(':renderRequest'));
  }

  clear() {
    this.gameObjectCanvas.clearGameObject();
  }

  getListGameObjects() {
    this.savedGameObjects = [];
    for (const [key, value] of localStorageEntries()) {
      if (key.startsWith('GameObject:')) this.savedGameObjects.push([key.split(':')[1], value]);
    }
  }

  async saveToLS() {
    const name = `GameObject:${this.name}`;
    const meta = this.gameObjectCanvas.save();
    localStorage.setItem(name, JSON.stringify(meta));
    this.getListGameObjects();
  }

  async load() {
    try {
      const meta = await (await fetch(this.metadataUrl)).json();
      this.gameObjectCanvas.load(meta);
      this.onHitBoxesUpdated(meta);
    } catch (error) {
      console.error('URL is invalid!');
    }
  }

  async loadFromLS([name, meta]: [string, string] = ['', '']) {
    try {
      this.name = name;
      const metadata = JSON.parse(meta);
      this.gameObjectCanvas.load(metadata);
      this.onHitBoxesUpdated(metadata);
    } catch (error) {
      console.error('Data is invalid!');
    }
  }

  // async loadFromLS() {
  //   try {
  //     const name = `GameObject:${this.name}`;
  //     const meta = JSON.parse(localStorage.getItem(name));
  //     this.gameObjectCanvas.load(meta);
  //   } catch (error) {
  //     console.error('Data is invalid!');
  //   }
  // }
}
</script>

<style lang="stylus" scoped>
.game-object-editor
  display grid
  width 100%
  grid-template-columns 300px auto
  grid-template-rows repeat(9, 64px) auto
  grid-gap 0 16px

  &__sidebar
    position sticky
    display grid
    grid-gap 16px
    padding 0 16px
    text-align left

  &__sidebar-separator
    width 100%
    height 1px
    background-color hsla(0, 0%, 0%, .1)

  &__body
    overflow auto
    grid-column 2/3
    grid-row 1/10

  &__game-object
    border 1px solid hsla(0, 0%, 0%, .1)

  &__size-input
    width 5em

</style>
