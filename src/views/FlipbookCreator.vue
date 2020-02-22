<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <button @click="showAnimationTab">Animation Settings</button>
      <button @click="showHitboxTab">Hitbox Settings</button>
    </div>
    <div :class="blockName | bemElement('content')">
      <div v-show="animation" :class="blockName | bemElement('animation-settings')">
        <div :class="blockName | bemElement('sprites')">
          <button @click="addFrame">Add frame</button>
          <div :class="blockName | bemElement('sprite-list')">
            <label v-for="sprite in sprites" v-bind:key="sprite.id">
              Sprite
              <input v-model="sprite.url">
            </label>
          </div>
        </div>
        <div :class="blockName | bemElement('flipbook')">
          <div :class="blockName | bemElement('actions')">
            <button @click="startAnimation">Start Animation</button>
            <button @click="stopAnimation">Stop Animation</button>
          </div>
          <canvas ref="renderer"></canvas>
        </div>
      </div>
      <div v-show="!animation" :class="blockName | bemElement('hitbox-settings')">
        <HitboxCreator
          :flipbook="flipbook"
          :sprites="sprites"
          :hitboxes="hitboxes"
          @saveHitbox="addHitbox"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Watch,
} from 'vue-property-decorator';

import { uuid } from '@/utils';
import Flipbook from '@/lib/core/RenderedObject/Flipbook';
import { IHitBox } from '@/lib/core/RenderedObject/GameObject/GameObject';
import HitboxCreator from '@/components/HitboxCreator.vue';

type sprite = {
  url: string;
  id: string;
  hitbox: IHitBox;
}

@Component({
  components: { HitboxCreator },
})
export default class FlipbookCreator extends Vue {
  private mods: Hash = {};
  private sprites: sprite[] = [];
  private flipbook: IFlipbook = null;

  private blockName: string = 'flipbook-creator';
  private ctx: CanvasRenderingContext2D;
  private image: string;

  private animation: boolean = true;
  private hitboxes: IHitBox[] = [];

  mounted() {
    this.ctx = this.$refs.renderer.getContext('2d');
  }

  addFrame() {
    this.sprites.push({ url: '', id: uuid(), hitbox: null });
  }

  addHitbox(hitbox: IHitBox) {
    this.hitboxes.push(hitbox);
  }

  async renderFlipbook() {
    if (this.flipbook && this.animation) {
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
      this.drawFlipbookRect();
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


  private drawFlipbookRect() {
    const { width, height } = this.flipbook;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, width, height);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
  }

  private startAnimation() {
    this.flipbook.start();
  }

  private stopAnimation() {
    this.flipbook.stop();
  }

  private showAnimationTab() {
    this.animation = true;
    this.renderFlipbook();
  }

  private showHitboxTab() {
    this.animation = false;
  }
}
</script>

<style lang="stylus" scoped>
.flipbook-creator
  width 100%
  display flex
  flex-direction column
  &__animation-settings
    display flex
    width 100%
  &__content
    display flex
  &__sprite-list
    display flex
    flex-direction column
  &__flipbook
    display flex
    flex-direction column
  &__sprites
    width 20%
  &__flipbook canvas, &__hitbox-settings canvas
    border 1px solid
</style>
