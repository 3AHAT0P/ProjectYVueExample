<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <button @click="addFrame">Add frame</button>
      <div :class="blockName | bemElement('sprite-list')">
        <label v-for="sprite in sprites" v-bind:key="sprite.id">
          Sprite
          <input v-model="sprite.url">
        </label>
      </div>
    </div>
    <div>
      <button @click="flipbook.start()">Start Animation</button>
      <button @click="flipbook.stop()">Stop Animation</button>
      <canvas ref="renderer"></canvas>
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
import { uuid } from '@/utils';
import Flipbook from '@/lib/core/RenderedObject/Flipbook';

const { BASE_URL } = process.env;
type sprite = {
  url: string;
  id: string;
}

@Component({
  components: { },
})
export default class FlipbookCreator extends Vue {
  private mods: Hash = {};
  private sprites: sprite[] = [];
  private flipbook: IFlipbook = null;

  private blockName: string = 'flipbook-creator';
  private ctx: CanvasRenderingContext2D;
  private image: string;

  mounted() {
    this.ctx = this.$refs.renderer.getContext('2d');
  }

  addFrame() {
    this.sprites.push({ url: '', id: uuid() });
  }

  async renderFlipbook() {
    if (this.flipbook) {
      const { width, height } = this.$refs.renderer;
      const { width: fw, height: fh } = this.flipbook;
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.drawImage(
        this.flipbook.currentSprite,
        0,
        0,
        fw,
        fh,
        0,
        0,
        fw,
        fh,
      );
      requestAnimationFrame(this.renderFlipbook.bind(this));
    }
  }

  @Watch('sprites', {
    deep: true,
  })
  protected async onSpitesChanged(newSprites: sprite[]): Promise<void> {
    const spritesWithUrl = newSprites.filter(sprite => sprite.url);
    const sprites = spritesWithUrl.map(sprite => sprite.url);
    if (sprites.length) {
      if (this.flipbook) this.flipbook.stop();
      try {
        this.flipbook = await Flipbook.create(sprites);
        this.flipbook.start();
        this.renderFlipbook();
      } catch (e) {
        this.flipbook = null;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.flipbook-creator
  width 100%
  display flex
  &__sprite-list
    display flex
    flex-direction column
</style>
