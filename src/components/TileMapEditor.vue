<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('sidebar')">
      <div>
        <button @click="create">Create new</button>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <label>
          <span>Resize (in tiles): </span>
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
        <span>Draw Level</span>
        <label>
          <input type="radio" :value="levelsENUM.BACKGROUND_LAYER" v-model="level">
          <span>{{levelsENUM.BACKGROUND_LAYER}}</span>
        </label>
        <label>
          <input type="radio" :value="levelsENUM.ZERO_LAYER" v-model="level">
          <span>{{levelsENUM.ZERO_LAYER}}</span>
        </label>
        <label>
          <input type="radio" :value="levelsENUM.FOREGROUND_LAYER" v-model="level">
          <span>{{levelsENUM.FOREGROUND_LAYER}}</span>
        </label>
      </div>
      <div>
        <button @click="clearCurrentLayer">Clear current layer</button>
        <button @click="clearAll">Clear all layers</button>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <div>
        <span>Visible Levels</span>
        <label>
          <input type="checkbox" :value="levelsENUM.BACKGROUND_LAYER" v-model="visibleLevels">
          <span>{{levelsENUM.BACKGROUND_LAYER}}</span>
        </label>
        <label>
          <input type="checkbox" :value="levelsENUM.ZERO_LAYER" v-model="visibleLevels">
          <span>{{levelsENUM.ZERO_LAYER}}</span>
        </label>
        <label>
          <input type="checkbox" :value="levelsENUM.FOREGROUND_LAYER" v-model="visibleLevels">
          <span>{{levelsENUM.FOREGROUND_LAYER}}</span>
        </label>
      </div>
      <div :class="blockName | bemElement('sidebar-separator')"></div>
      <button @click="save">Save tilemap as File</button>
      <button @click="saveToLS">Save tilemap to LocalStorage</button>
    </div>
    <div :class="blockName | bemElement('body')">
      <canvas key="canvas" :class="blockName | bemElement('tile-map')" ref="canvas"></canvas>
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

import TileMap from '@/lib/core/TileMap/TileMap';

import {
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  LAYER_INDEX,
} from '@/lib/core/Canvas/mixins/tileableCanvas/buildLayers';

import Point from '@/lib/core/utils/classes/Point';
import Tile from '@/lib/core/RenderedObject/Tile';

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class TileMapEditor extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => (new Map()) }) private tiles!: Map<string, Tile>;

  private blockName: string = 'tile-map-editor';

  private mainTileMap: TileMap = null;
  private metadataUrl: string = `${BASE_URL}tilemaps/tilemap.json`;

  private levelsENUM: any = null;
  private level: LAYER_INDEX = ZERO_LAYER;
  private visibleLevels: LAYER_INDEX[] = [BACKGROUND_LAYER, ZERO_LAYER, FOREGROUND_LAYER];

  private tileMapX: number = 32;
  private tileMapY: number = 32;

  constructor(...args: any) {
    super(...args);

    this.onMultiSelect = this.onMultiSelect.bind(this);
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
    this.mainTileMap = await TileMap.create({
      el: this.$refs.canvas as HTMLCanvasElement,
      metadataUrl: this.metadataUrl,
      size: {
        width: this.tileMapX,
        height: this.tileMapY,
      },
    });

    this.tileMapX = this.mainTileMap.sizeInTiles.x;
    this.tileMapY = this.mainTileMap.sizeInTiles.y;

    this.mainTileMap.on(':multiSelect', this.onMultiSelect);
  }

  @Watch('tiles')
  private onTilesChange(tiles: Map<string, Tile>) {
    this.mainTileMap.updateCurrentTiles(tiles);
  }

  @Watch('level')
  private onLevelChange(level: LAYER_INDEX) {
    this.mainTileMap.updateCurrentLayerIndex(level);
  }

  @Watch('visibleLevels')
  private onVisibleLevelChange(visibleLevels: LAYER_INDEX[]) {
    this.mainTileMap.updateVisibleLayers(visibleLevels);
  }

  async save() {
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);

    const { meta } = await this.mainTileMap.save();

    const blob = new Blob([JSON.stringify(meta)], { type: 'application/json' });
    a.href = URL.createObjectURL(blob);
    a.download = 'tilemap.json';
    a.click();
    URL.revokeObjectURL(a.href);

    a.remove();
  }

  async saveToLS() {
    const { meta } = await this.mainTileMap.save();
    localStorage.setItem('MainTileMap', JSON.stringify(meta));
  }

  async load() {
    try {
      await this.mainTileMap.updateMetadataUrl(this.metadataUrl);
    } catch (error) {
      console.error('URL is invalid!');
    }
  }

  async loadFromLS() {
    try {
      const data = JSON.parse(localStorage.getItem('MainTileMap'));
      await this.mainTileMap.updateMetadata(data);
    } catch (error) {
      console.error('Data is invalid!');
    }
  }

  async create() {
    try {
      await this.mainTileMap.updateMetadataUrl('');
    } catch (error) {
      console.error('URL is invalid!');
    }
  }

  async resize() {
    this.mainTileMap.updateTilesCount(Number(this.tileMapX), Number(this.tileMapY));
  }

  clearCurrentLayer() {
    this.mainTileMap.clearLayer(this.level);
  }

  clearAll() {
    this.mainTileMap.clearLayer('ALL');
  }

  onMultiSelect({ tiles }: any) {
    if (tiles != null) this.$emit('tilesChanged', tiles);
  }
}
</script>

<style lang="stylus" scoped>
.tile-map-editor
  display grid
  width 100%
  grid-template-columns 200px auto
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

  // &__tile-map

  &__size-input
    width 5em

</style>
