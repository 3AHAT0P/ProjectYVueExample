<template>
  <div :class="blockName">
    <div :class="blockName | bemElement('actions')">
      <button @click="startAnimation">Start Animation</button>
      <button @click="stopAnimation">Stop Animation</button>
    </div>
    <canvas ref="renderer"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import { nextFrame } from '../lib/core/utils/delayers';
import Flipbook from '@/lib/core/RenderedObject/Sprite/Flipbook';
import Sprite from '@/lib/core/RenderedObject/Sprite/Sprite';

const BROWSER_FRAME_RATE = 60;

  @Component({
    components: {},
    props: ['flipBook', 'shownSpriteIndex'],
  })
export default class FlipBookRenderer extends Vue {
    private blockName: string = 'flipBook-renderer';

    private ctx: CanvasRenderingContext2D;
    private flipBook: Flipbook;
    private animation: boolean;
    private currentAnimationId: number;

    mounted() {
      this.ctx = (this.$refs.renderer as HTMLCanvasElement).getContext('2d');
    }

    private startAnimation() {
      this.animation = true;
      this.renderFlipBook();
    }

    private stopAnimation() {
      if (this.currentAnimationId) cancelAnimationFrame(this.currentAnimationId);
      this.currentAnimationId = null;
      this.animation = false;
      if (this.flipBook) this.flipBook.reset();
    }

    async renderFlipBook() {
      if (this.flipBook && this.animation) {
        this.flipBook.tick(performance.now());
        const source = this.flipBook.currentSprite.source;
        this.renderSprite(source);
        this.drawFlipBookRect(source);
        this.currentAnimationId = requestAnimationFrame(this.renderFlipBook.bind(this));
      }
    }

    renderSprite(source: CanvasImageSource) {
      const { width: w, height: h } = source;
      const { width, height } = this.$refs.renderer as HTMLCanvasElement;

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.drawImage(
        source,
        0,
        0,
        Number(w),
        Number(h),
        0,
        0,
        Number(w),
        Number(h),
      );
    }

    private drawFlipBookRect(source: CanvasImageSource) {
      const { width, height } = source;
      this.ctx.beginPath();
      this.ctx.rect(0, 0, Number(width), Number(height));
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'black';
      this.ctx.stroke();
    }

  @Watch('shownSpriteIndex')
    private showChosenSprite(newSpriteIndex: number) {
      if (newSpriteIndex != null) {
        this.stopAnimation();
        const { source } = this.flipBook.getSpriteByIndex(newSpriteIndex);
        this.renderSprite(source);
        this.drawFlipBookRect(source);
      }
    }
}
</script>

<style></style>
