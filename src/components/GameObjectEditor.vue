<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('sidebar')">
      <div>
        <button @click="create">Create new</button>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <label><span>Name: </span><input type="text" v-model="name"></label>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <label>
          <span>Resize (in pixels): </span>
          <br>
          <input type="number" :class="blockName | bemElement('size-input')" v-model="tileMapX">
          X
          <input type="number" :class="blockName | bemElement('size-input')" v-model="tileMapY">
        </label>
        <button @click="resize">Apply</button>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <label><span>Metadata file URL: </span><input type="text" v-model="metadataUrl"></label>
        <button @click="load">Load</button>
        <button @click="loadFromLS">Load from LocalStorage</button>
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
            v-model="hitBox.from.offsetX"
            @change="rerender"
          >
          y1 <input
            v-if="hitBox.from"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.from.offsetY"
            @change="rerender"
          >
          <br>
          x2 <input
            v-if="hitBox.to"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.to.offsetX"
            @change="rerender"
          >
          y2 <input
            v-if="hitBox.to"
            type="number"
            :class="blockName | bemElement('size-input')"
            v-model="hitBox.to.offsetY"
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

import TileMap from '@/lib/core/TileMap';

import {
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  LAYER_INDEX,
} from '@/lib/core/Canvas/mixins/tileableCanvas';

import CanvasClassBuilder from '@/lib/core/Canvas/CanvasClassBuilder';
import Point from '@/lib/core/utils/classes/Point';
import Tile from '@/lib/core/utils/classes/Tile';
import getTilesRectSizes from '@/lib/core/utils/getTilesRectSizes';
import drawImageFromMap from '@/lib/core/utils/drawImageFromMap';

import buildEvent from '@/lib/core/utils/buildEvent';

import { getRandomArbitraryInt } from '@/utils/';

const { BASE_URL } = process.env;

const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');

const Canvas = new CanvasClassBuilder()
  .applyResizeableMixin()
  .build();

class GameObjectCanvas extends Canvas {
  private _cache: HTMLCanvasElement = document.createElement('canvas');
  private _cacheCtx: CanvasRenderingContext2D = null;

  private _modKey = 'shiftKey';

  private _eventDown: MouseEvent = null;
  private _eventMove: MouseEvent = null;

  private _hitBoxes: any[] = [];

  private [_onMouseDownHandler](event: MouseEvent) {
    if ((event as any)[this._modKey]) this._eventDown = event;
    this._el.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
  }

  private [_onMouseMoveHandler](event: MouseEvent) {
    if ((event as any)[this._modKey]) this._eventMove = event;
    this._renderInNextFrame();
  }

  private [_onMouseUpHandler](event: MouseEvent) {
    if (this._eventDown == null) return;
    if ((event as any)[this._modKey]) {
      this._el.removeEventListener('mousemove', this[_onMouseMoveHandler]);
      const hitBox = {
        id: this._hitBoxes.length,
        color: getRandomArbitraryInt(0, 300),
        from: {
          offsetX: 0,
          offsetY: 0,
        },
        to: {
          offsetX: 0,
          offsetY: 0,
        },
      };
      if (this._eventDown.offsetX > event.offsetX) {
        hitBox.from.offsetX = Math.round(event.offsetX / this.sizeMultiplier);
        hitBox.to.offsetX = Math.round(this._eventDown.offsetX / this.sizeMultiplier);
      } else {
        hitBox.to.offsetX = Math.round(event.offsetX / this.sizeMultiplier);
        hitBox.from.offsetX = Math.round(this._eventDown.offsetX / this.sizeMultiplier);
      }
      if (this._eventDown.offsetY > event.offsetY) {
        hitBox.from.offsetY = Math.round(event.offsetY / this.sizeMultiplier);
        hitBox.to.offsetY = Math.round(this._eventDown.offsetY / this.sizeMultiplier);
      } else {
        hitBox.to.offsetY = Math.round(event.offsetY / this.sizeMultiplier);
        hitBox.from.offsetY = Math.round(this._eventDown.offsetY / this.sizeMultiplier);
      }
      this._eventDown = null;
      this._eventMove = null;
      this._hitBoxes.push(hitBox);
      this.dispatchEvent(buildEvent(':hitBoxsUpdated', null, { hitBoxes: this._hitBoxes }));
      this._renderInNextFrame();
    }
  }

  private _drawCurrentRect() {
    if (this._eventDown == null || this._eventMove == null) return;

    const ctx: CanvasRenderingContext2D = this._ctx;
    this._ctx.save();
    ctx.strokeStyle = 'hsla(0, 0%, 0%, .6)';

    // const path = new Path();

    // ctx.beginPath();

    ctx.strokeRect(
      this._eventDown.offsetX,
      this._eventDown.offsetY,
      this._eventMove.offsetX - this._eventDown.offsetX,
      this._eventMove.offsetY - this._eventDown.offsetY,
    );
    ctx.fillStyle = 'hsla(0, 0%, 100%, .2)';
    ctx.fillRect(
      this._eventDown.offsetX,
      this._eventDown.offsetY,
      this._eventMove.offsetX - this._eventDown.offsetX,
      this._eventMove.offsetY - this._eventDown.offsetY,
    );
    ctx.restore();
  }

  private _drawHitBoxes() {
    if (this._hitBoxes.length === 0) return;

    const ctx: CanvasRenderingContext2D = this._ctx;
    this._ctx.save();
    for (const hitBox of this._hitBoxes) {
      ctx.strokeStyle = `hsla(${hitBox.color}, 50%, 50%, .6)`;
      ctx.fillStyle = `hsla(${hitBox.color}, 50%, 50%, .2)`;

      ctx.strokeRect(
        hitBox.from.offsetX * this.sizeMultiplier,
        hitBox.from.offsetY * this.sizeMultiplier,
        (hitBox.to.offsetX - hitBox.from.offsetX) * this.sizeMultiplier,
        (hitBox.to.offsetY - hitBox.from.offsetY) * this.sizeMultiplier,
      );
      ctx.fillRect(
        hitBox.from.offsetX * this.sizeMultiplier,
        hitBox.from.offsetY * this.sizeMultiplier,
        (hitBox.to.offsetX - hitBox.from.offsetX) * this.sizeMultiplier,
        (hitBox.to.offsetY - hitBox.from.offsetY) * this.sizeMultiplier,
      );
    }
    ctx.restore();
  }

  protected _render(...args: any[]) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this._ctx.drawImage(
      this._cache,
      0,
      0,
      this._cache.width,
      this._cache.height,
      0,
      0,
      this._el.width,
      this._el.height,
    );
    this._drawHitBoxes();
    this._drawCurrentRect();
    // this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
  }

  constructor(options: any = {}) {
    super(options);
    this._cache.width = this._el.width;
    this._cache.height = this._el.height;
    this._cacheCtx = this._cache.getContext('2d');
    this._cacheCtx.imageSmoothingEnabled = this._imageSmoothingEnabled;

    this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
    this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
    this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
  }

  async _initListeners() {
    await super._initListeners();

    this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
    this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
  }

  public updateSize(width: number, height: number) {
    super.updateSize(width, height);
    // this._cache.width = width;
    // this._cache.height = height;
  }

  public updateCache(cb: any) {
    this._cacheCtx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    cb(this._cache.getContext('2d'));
  }

  public save() {
    const data = this._cache.toDataURL('image/png', 1);
    const hitBoxes = this._hitBoxes;
    return { data, hitBoxes };
  }

  public load({ data, hitBoxes }: any) {
    const img = new Image();
    img.onload = () => {
      this._cacheCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this._cache.width, this._cache.height);
      this._renderInNextFrame();
    };
    img.src = data;
    this._hitBoxes = hitBoxes;
  }
}

@Component({
  components: { },
})
export default class GameObjectEditor extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => (new Map()) }) private tiles!: Map<string, Tile>;

  private blockName: string = 'game-object-editor';

  private gameObjectCanvas: any = null;

  private metadataUrl: string = `${BASE_URL}game-objects/player-mage.json`;

  private levelsENUM: any = null;
  private level: LAYER_INDEX = ZERO_LAYER;
  private visibleLevels: LAYER_INDEX[] = [BACKGROUND_LAYER, ZERO_LAYER, FOREGROUND_LAYER];

  private tileMapX: number = 128;
  private tileMapY: number = 128;

  private hitBoxes: any[] = [];

  private name: string = '';

  constructor(...args: any[]) {
    super(...args);

    this.onHitBoxesUpdated = this.onHitBoxesUpdated.bind(this);
  }

  created() {
    Vue.set(this, 'levelsENUM', {
      BACKGROUND_LAYER,
      ZERO_LAYER,
      FOREGROUND_LAYER,
    });
  }

  mounted() {
    this.init();
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

    this.gameObjectCanvas.addEventListener(':hitBoxsUpdated', this.onHitBoxesUpdated);
  }

  @Watch('tiles')
  private onTilesChange(tiles: Map<string, Tile>) {
    // this.mainTileMap.updateCurrentTiles(tiles);
    // const { xCount, yCount } = getTilesRectSizes(tiles);
    // const tileSize = tiles.get('0|0').size;
    // const width = tileSize.x * xCount;
    // const height = tileSize.y * yCount;

    // this.gameObjectCanvas.updateSize(width, height);

    const canvas = document.createElement('canvas');
    this.gameObjectCanvas.updateCache((ctx: CanvasRenderingContext2D) => {
      drawImageFromMap(
        tiles,
        ctx,
        this.gameObjectCanvas.width / this.gameObjectCanvas.sizeMultiplier,
        this.gameObjectCanvas.height / this.gameObjectCanvas.sizeMultiplier,
        true,
      );
    });

    this.gameObjectCanvas.dispatchEvent(new Event(':renderRequest'));
  }

  @Watch('level')
  private onLevelChange(level: LAYER_INDEX) {
    // this.mainTileMap.updateCurrentLayerIndex(level);
  }

  @Watch('visibleLevels')
  private onVisibleLevelChange(visibleLevels: LAYER_INDEX[]) {
    // this.mainTileMap.updateVisibleLayers(visibleLevels);
  }

  private onHitBoxesUpdated({ hitBoxes }: any) {
    this.hitBoxes = hitBoxes;
    console.log(hitBoxes);
  }

  private rerender() {
    this.gameObjectCanvas.dispatchEvent(new Event(':renderRequest'));
  }

  async saveToLS() {
    const meta = this.gameObjectCanvas.save();
    localStorage.setItem(this.name, JSON.stringify(meta));
  }

  async load() {
    try {
      const meta = await (await fetch(this.metadataUrl)).json();
      this.gameObjectCanvas.load(meta);
    } catch (error) {
      console.error('URL is invalid!');
    }
  }

  async loadFromLS() {
    try {
      const meta = JSON.parse(localStorage.getItem(this.name));
      this.gameObjectCanvas.load(meta);
    } catch (error) {
      console.error('Data is invalid!');
    }
  }

  async create() {
    // try {
    //   await this.mainTileMap.updateMetadataUrl('');
    // } catch (error) {
    //   console.error('URL is invalid!');
    // }
  }

  async resize() {
    // this.mainTileMap.updateTilesCount(Number(this.tileMapX), Number(this.tileMapY));
  }
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
