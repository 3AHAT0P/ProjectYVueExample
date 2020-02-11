<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <label><span>Tileset meta URL: </span><input type="text" v-model="internalImageUrl"></label>
      <button @click="load">Load</button>
    </div>
    <canvas key="canvas" :class="blockName | bemElement('tile-set') | bemMods(mods)" ref="canvas"></canvas>
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

import TileSet from '@/lib/core/TileSet/TileSet';

import Point from '@/lib/core/utils/classes/Point';
import Tile from '@/lib/core/RenderedObject/Tile';

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class TileSetView extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => null as string }) private imageUrl!: string;

  private blockName: string = 'tile-set-view';

  private mainTileSet: any = null;
  private internalImageUrl: string = `${BASE_URL}tilesets/main-tile-set.png`;

  constructor(...args: any) {
    super(...args);

    this.onMultiSelect = this.onMultiSelect.bind(this);
  }

  created() {
    if (this.imageUrl != null) this.internalImageUrl = this.imageUrl;
  }

  mounted() {
    this.init();
  }

  onMultiSelect({ tiles }: any) {
    if (tiles != null) this.$emit('tilesChanged', tiles);
  }

  async init() {
    this.mainTileSet = await TileSet.create({
      el: this.$refs.canvas as HTMLCanvasElement,
      imageUrl: this.internalImageUrl,
    });

    this.mainTileSet.addEventListener(':multiSelect', this.onMultiSelect);
  }

  async load() {
    try {
      await this.mainTileSet.updateImageUrl(this.internalImageUrl);
    } catch (error) {
      console.error('URL is invalid!');
    }
  }
}
</script>

<style lang="stylus" scoped>
.tile-set-view
  width 100%
</style>
