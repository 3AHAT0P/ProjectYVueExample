<template>
  <div :class="blockName | bemMods(mods)">
    <TileMapEditor key="tileMapEditor" :tiles="tiles"></TileMapEditor>
    <div><canvas class="brush-preview" ref="brushPreview"></canvas></div>
    <TileSetView key="tileSetView" @tilesChanged="updateTiles"></TileSetView>
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
import MainTileMap from '@/lib/core/tilemap';

import Canvas from '@/lib/core/canvas/canvas';

import ResizeableCanvasMixin from '@/lib/core/canvas/mixins/resizeable-canvas';
import TileableCanvasMixin from '@/lib/core/canvas/mixins/tileable-canvas';
import DrawableCanvasMixin from '@/lib/core/canvas/mixins/drawable-canvas';

import Point from '@/lib/core/utils/point';
import Tile from '@/lib/core/utils/tile';

import TileMapEditor from '@/components/TileMapEditor.vue';
import TileSetView from '@/components/TileSetView.vue';

const { BASE_URL } = process.env;

@Component({
  components: { TileMapEditor, TileSetView },
})
export default class Editor extends Vue {
  private mods: Hash = {};

  private blockName: string = 'editor';

  private currentTileCanvas: any = null;

  private tiles: Map<string, Tile> = null;

  mounted() {
    this.init();
  }

  async init() {
    this.currentTileCanvas = await Canvas.create({
      el: this.$refs.brushPreview,
      size: { width: 64, height: 64 },
    });
  }

  updateTiles(tiles: Map<string, Tile>) {
    if (tiles == null) return;

    this.tiles = tiles;
    this.currentTileCanvas.addEventListener(':render', (event: any) => {
      const width = 64;
      const height = 64;
      let maxX = 0;
      let maxY = 0;
      for (const [place, tile] of tiles.entries()) {
        const [y, x] = Point.fromString(place).toArray();
        if (y > maxY) maxY = y;
        if (x > maxX) maxX = x;
      }
      const tileWidth = width / (maxX + 1);
      const tileHeight = height / (maxX + 1);
      for (const [place, tile] of tiles.entries()) {
        const [y, x] = Point.fromString(place).toArray();
        event.ctx.drawImage(
          tile.source.data,
          tile.sourceRegion.x * tile.source.tileSize.x,
          tile.sourceRegion.y * tile.source.tileSize.y,
          tile.source.tileSize.x,
          tile.source.tileSize.y,
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight,
        );
      }
    }, { once: true });
    this.currentTileCanvas.dispatchEvent(new Event(':renderRequest'));
  }
}
</script>

<style lang="stylus">
.editor
  width 100%
</style>
