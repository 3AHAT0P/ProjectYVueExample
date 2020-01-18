<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <label><span>Tilemap meta URL: </span><input type="text" v-model="metadataUrl"></label>
      <button @click="load">Load</button>
    </div>
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
      <button @click="clearCurrentLayer">Clear current layer</button>
      <button @click="clearAll">Clear all layers</button>
    </div>
    <canvas key="canvas" :class="blockName | bemElement('tile-map') | bemMods(mods)" ref="canvas"></canvas>
    <button @click="save">Save</button>
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

import MainTileMap from '@/lib/core/tilemap';


import {
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  LAYER_INDEX,
} from '@/lib/core/canvas/mixins/tileable-canvas';

import Point from '@/lib/core/utils/point';
import Tile from '@/lib/core/utils/tile';

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class Editor extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => (new Map()) }) private tiles!: Map<string, Tile>;

  private blockName: string = 'tile-map-editor';

  private mainTileMap: any = null;
  private metadataUrl: string = `${BASE_URL}tilemaps/tilemap.json`;

  private levelsENUM: any = null;
  private level: LAYER_INDEX = ZERO_LAYER;

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
    this.mainTileMap = await MainTileMap.create({
      el: this.$refs.canvas,
      metadataUrl: this.metadataUrl,
    });
  }

  @Watch('tiles')
  private onTilesChange(tiles: Map<string, Tile>) {
    this.mainTileMap.updateCurrentTiles(tiles);
  }

  @Watch('level')
  private onLevelChange(level: LAYER_INDEX) {
    this.mainTileMap.updateCurrentLayerIndex(level);
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

  async load() {
    try {
      await this.mainTileMap.updateMetadataUrl(this.metadataUrl);
    } catch (error) {
      console.error('URL is invalid!');
    }
  }

  clearCurrentLayer() {
    this.mainTileMap.clearLayer(this.level);
  }

  clearAll() {
    this.mainTileMap.clearLayer('ALL');
  }
}
</script>

<style lang="stylus">
.editor
  width 100%
</style>
