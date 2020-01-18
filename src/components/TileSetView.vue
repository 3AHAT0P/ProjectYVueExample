<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <label><span>Tileset meta URL: </span><input type="text" v-model="imageUrl"></label>
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

import MainTileSet from '@/lib/core/tileset';

import Point from '@/lib/core/utils/point';
import Tile from '@/lib/core/utils/tile';

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class Editor extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;

  private blockName: string = 'tile-map-editor';

  private mainTileSet: any = null;
  private imageUrl: string = `${BASE_URL}tilesets/main-tile-set.png`;

  constructor(...args: any) {
    super(...args);

    this.onMultiSelect = this.onMultiSelect.bind(this);
  }

  mounted() {
    this.init();
  }

  onMultiSelect({ tiles }: any) {
    if (tiles != null) this.$emit('tilesChanged', tiles);
  }

  async init() {
    this.mainTileSet = await MainTileSet.create({
      el: this.$refs.canvas,
      imageUrl: this.imageUrl,
    });

    this.mainTileSet.addEventListener(':multiSelect', this.onMultiSelect);
  }

  async load() {
    try {
      await this.mainTileSet.updateImageUrl(this.imageUrl);
    } catch (error) {
      console.error('URL is invalid!');
    }
  }
}
</script>

<style lang="stylus">
.editor
  width 100%
</style>
