<template>
  <div :class="blockName | bemMods(mods)">
    AAA
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

@Component({
  components: { },
})
export default class Editor extends Vue {
  private mods: Hash = {};

  private blockName: string = 'editor';
}
</script>

<style lang="stylus">
.editor
  width 100%
</style>
