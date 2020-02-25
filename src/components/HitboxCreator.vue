<template>
  <div :class="blockName">
    <div>
      <label>
        Choose sprite
        <select v-model="chosenSpriteIndex">
          <option v-for="(sprite, index) in sprites" v-bind:key="sprite.id" v-bind:value="index">
            {{sprite.sourceURL}}
          </option>
        </select>
      </label>
      <button @click="saveHitbox">Save Hitboxes for the sprite</button>
      <button @click="resetHitbox">Reset Hitboxes for the sprite</button>
    </div>
    <canvas ref="hitboxCreator"></canvas>
    <div>
      <span>Hitboxes</span>
      <p>
        {{sprites}}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IHitBox } from '@/lib/core/HitBox/HitBox';

  type sprite = {
    url: string;
    id: string;
    hitboxes: IHitBox;
  }

  @Component({
    components: { },
    props: ['sprites', 'flipbook'],
  })
export default class HitboxCreator extends Vue {
    private blockName: string = 'hitbox-creator';

    private chosenSpriteIndex: number = null;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private startPoint: { x: number; y: number };
    private mousedown: boolean;
    private hitboxes: IHitBox[] = [];
    private hitbox: IHitBox;
    private flipbook: IFlipbook;

    mounted() {
      this.canvas = this.$refs.hitboxCreator;
      this.ctx = this.$refs.hitboxCreator.getContext('2d');

      this.initDrawListeners();
    }

    saveHitbox() {
      if (this.hitboxes) this.$emit('saveHitbox', this.chosenSpriteIndex, this.hitboxes);
      this.hitboxes = [];
    }

    resetHitbox() {
      this.hitboxes = [];
      this.hitbox = null;
      this.showChosenSprite();
    }

    @Watch('chosenSpriteIndex')
    protected showChosenSprite() {
      const { width, height } = this.canvas;
      const sprite = this.flipbook.getSpriteByIndex(this.chosenSpriteIndex);
      const { width: fw, height: fh } = sprite.sourceBoundingRect;
      this.canvas.width = fw;
      this.canvas.height = fh;

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.drawImage(
        sprite.source,
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
      this.drawSpriteHitboxes(sprite.hitBoxes);
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
      this.hitboxes.push(this.hitbox);
      this.hitbox = null;
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

        this.hitbox = { id: Date.now(), from: { x, y }, to: { x: offsetX, y: offsetY } };
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

    private drawSpriteHitboxes(hitboxes: IHitBox[]) {
      if (hitboxes.length) {
        hitboxes.forEach(hitbox => this.drawHitbox(hitbox));
      }

      if (this.hitboxes.length) this.hitboxes.forEach(ownHitbox => this.drawHitbox(ownHitbox));
    }

    private drawHitbox(hitbox: IHitBox) {
      const { from: { x, y }, to: { x: offsetX, y: offsetY } } = hitbox;
      const width = offsetX - x;
      const height = offsetY - y;

      this.ctx.beginPath();
      this.ctx.rect(x, y, width, height);
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'blue';
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
