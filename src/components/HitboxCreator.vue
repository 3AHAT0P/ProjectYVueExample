<template>
  <div :class="blockName">
    <div>
      <label>
        Choose sprite
        <select v-model="chosenSprite">
          <option v-for="sprite in sprites" v-bind:key="sprite.id" v-bind:value="sprite">
            {{sprite.url}}
          </option>
        </select>
      </label>
      <button @click="saveHitbox">Save Hitbox for the sprite</button>
    </div>
    <canvas ref="hitboxCreator"></canvas>
    <div>
      <span>Hitboxes</span>
      <p>
        {{hitboxes}}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IHitBox } from '@/lib/core/RenderedObject/GameObject/GameObject';

  type sprite = {
    url: string;
    id: string;
    hitbox: IHitBox;
  }

  @Component({
    components: { },
    props: ['sprites', 'flipbook', 'hitboxes'],
  })
export default class HitboxCreator extends Vue {
    private blockName: string = 'hitbox-creator';

    private chosenSprite: sprite = null;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private startPoint: { x: number; y: number };
    private mousedown: boolean;
    private hitbox: { from: { x: number; y: number }; to: { x: number; y: number } };

    mounted() {
      this.canvas = this.$refs.hitboxCreator;
      this.ctx = this.$refs.hitboxCreator.getContext('2d');

      this.initDrawListeners();
    }

    saveHitbox() {
      if (this.hitbox) this.$emit('saveHitbox', this.hitbox);
    }

    @Watch('chosenSprite')
    protected showChosenSprite() {
      const { width, height } = this.canvas;
      const sprite = this.flipbook.getSpriteByUrl(this.chosenSprite.url);
      const { width: fw, height: fh } = sprite;

      this.canvas.width = fw;
      this.canvas.height = fh;

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.drawImage(
        sprite.currentSprite,
        0,
        0,
        fw,
        fh,
        0,
        0,
        fw,
        fh,
      );
      this.drawSpriteRect();
    }

    initDrawListeners() {
      this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
      this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
      this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onMouseDown(e: MouseEvent) {
      const { offsetX, offsetY } = e;
      this.startPoint = { x: offsetX, y: offsetY };
      this.mousedown = true;
    }

    onMouseUp() {
      this.mousedown = false;
    }

    onMouseMove(e: MouseEvent) {
      if (this.mousedown) {
        const { offsetX, offsetY } = e;
        const { x, y } = this.startPoint;
        this.showChosenSprite();

        this.ctx.beginPath();
        const width = offsetX - x;
        const height = offsetY - y;
        this.ctx.rect(x, y, width, height);
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.hitbox = { from: { x, y }, to: { x: offsetX, y: offsetY } };
      }
    }

    private drawSpriteRect() {
      const { width, height } = this.canvas;
      this.ctx.beginPath();
      this.ctx.rect(0, 0, width, height);
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'black';
      this.ctx.stroke();
    }
}
</script>

<style lang="stylus">
  .hitbox-creator
    display flex
    flex-direction column
    align-items center
</style>
