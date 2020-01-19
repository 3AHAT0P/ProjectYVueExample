<template>
  <div :class="blockName | bemMods(mods)">
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

const { BASE_URL } = process.env;

@Component({
  components: { },
})
export default class FlipbookCreator extends Vue {
  private mods: Hash = {};

  private blockName: string = 'flipbook-creator';
}
</script>

<style lang="stylus" scoped>
.flipbook-creator
  width 100%
  display grid
</style>
