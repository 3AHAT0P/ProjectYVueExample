<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <canvas class="main-tile-map" ref="mainTileMap"></canvas>
      <button @click="saveTileMap">Save</button>
    </div>
    <div><canvas class="brush-preview" ref="brushPreview"></canvas></div>
    <div><canvas class="main-tile-set" ref="mainTileSet"></canvas></div>
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

const { BASE_URL } = process.env;

const MainTileSetUrl = `${BASE_URL}tilesets/main-tile-set.png`;
const MainTileMapUrl = `${BASE_URL}tilemaps/tilemap.png`;
const MainTileMapMetaUrl = `${BASE_URL}tilemaps/tilemap.json`;

@Component({
  components: { },
})
export default class Editor extends Vue {
  private mods: Hash = {};

  private blockName: string = 'editor';

  private mainTileSet: any = null;
  private mainTileMap: any = null;

  mounted() {
    this.init();
  }

  async init() {
    const mainTileMap = await MainTileMap.create({
      el: this.$refs.mainTileMap,
      imageUrl: MainTileMapUrl,
      metadataUrl: MainTileMapMetaUrl,
    });
    const currentTileCanvas = await Canvas.create({
      el: this.$refs.brushPreview,
      size: { width: 64, height: 64 },
    });
    const mainTileSet = await MainTileSet.create({
      el: this.$refs.mainTileSet,
      imageUrl: MainTileSetUrl,
    });

    this.mainTileMap = mainTileMap;
    this.mainTileSet = mainTileSet;

    mainTileSet.addEventListener(':multiSelect', ({ tiles }: any) => {
      // @ts-ignore
      mainTileMap.updateCurrentTiles(tiles);
      mainTileMap.dispatchEvent(new Event(':renderRequest'));
      if (tiles != null) {
        currentTileCanvas.addEventListener(':render', (event: any) => {
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
            event.ctx.drawImage(tile.bitmap, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
          }
        }, { once: true });
        currentTileCanvas.dispatchEvent(new Event(':renderRequest'));
      }
    });
  }

  async saveTileMap() {
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
}
</script>

<style lang="stylus">
.editor
  width 100%
</style>
