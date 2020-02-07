<template>
  <div :class="blockName | bemMods(mods)">
    <TileSetView
      key="tileSetView"
      :class="blockName | bemElement('tile-set')"
      :imageUrl="sourceImageUrl"
      @tilesChanged="updateTiles"
    ></TileSetView>
    <GameObjectEditor
      key="GameObjectEditor"
      :class="blockName | bemElement('game-object')"
      :tiles="tiles"
    ></GameObjectEditor>
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

import GameObjectEditor from '@/components/GameObjectEditor.vue';
import TileSetView from '@/components/TileSetView.vue';

import Tile from '@/lib/core/RenderedObject/Tile';

const { BASE_URL } = process.env;

@Component({
  components: { GameObjectEditor, TileSetView },
})
export default class GameObjectCreator extends Vue {
  private mods: Hash = {};

  private blockName: string = 'game-object-creator';

  private sourceImageUrl: string = `${BASE_URL}game-objects/mage.png`;

  private tiles: Map<string, Tile> = null;

  updateTiles(tiles: Map<string, Tile>) {
    if (tiles == null) return;

    this.tiles = tiles;
  }
}
</script>

<style lang="stylus" scoped>
.game-object-creator
  width 100%
  display grid
  &__tile-set
    grid-row 1/2
    grid-column 3/4
  &__game-object
    grid-row 2/3
    grid-column 1/4
</style>
