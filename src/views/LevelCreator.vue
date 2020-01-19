<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('brush-preview')">
      Brush tile preview
      <br>
      <br>
      <canvas ref="brushPreview" style="outline: 1px solid hsla(0, 0%, 0%, .1);"></canvas>
    </div>
    <TileSetView
      key="tileSetView"
      :class="blockName | bemElement('tile-set')"
      @tilesChanged="updateTiles"
    ></TileSetView>
    <TileMapEditor
      key="tileMapEditor"
      :class="blockName | bemElement('tile-map')"
      :tiles="tiles"
    ></TileMapEditor>
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

import CanvasClassBuilder from '@/lib/core/canvas/builder';

import Point from '@/lib/core/utils/point';
import Tile from '@/lib/core/utils/tile';
import drawImageFromMap from '@/lib/core/utils/draw-image-from-map';

import TileMapEditor from '@/components/TileMapEditor.vue';
import TileSetView from '@/components/TileSetView.vue';

const { BASE_URL } = process.env;

@Component({
  components: { TileMapEditor, TileSetView },
})
export default class LevelCreator extends Vue {
  private mods: Hash = {};

  private blockName: string = 'level-creator';

  private currentTileCanvas: any = null;

  private tiles: Map<string, Tile> = null;

  mounted() {
    this.init();
  }

  async init() {
    this.currentTileCanvas = await new CanvasClassBuilder().instantiate({
      el: this.$refs.brushPreview,
      size: { width: 128, height: 128 },
    });
  }

  updateTiles(tiles: Map<string, Tile>) {
    if (tiles == null) return;

    this.tiles = tiles;
    this.currentTileCanvas.addEventListener(':render', (event: any) => {
      drawImageFromMap(tiles, event.ctx, this.currentTileCanvas.width, this.currentTileCanvas.height, true);
    }, { once: true });
    this.currentTileCanvas.dispatchEvent(new Event(':renderRequest'));
  }
}
</script>

<style lang="stylus" scoped>
.level-creator
  width 100%
  display grid
  grid-template-columns 200px 1fr 1fr
  grid-template-rows 470px 1fr
  &__brush-preview
    grid-row 1/2
    grid-column 1/2
  &__tile-set
    grid-row 1/2
    grid-column 3/4
  &__tile-map
    grid-row 2/3
    grid-column 1/4
</style>
