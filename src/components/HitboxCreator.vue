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
    <div>
      <div>
        <label>
          Top
          <input type="number" v-model="hitbox.from.y">
        </label>
        <label>
          Right
          <input type="number" v-model="hitbox.to.x">
        </label>
        <label>
          Bottom
          <input type="number" v-model="hitbox.to.y">
        </label>
        <label>
          Left
          <input type="number" v-model="hitbox.from.x">
        </label>
      </div>
      <canvas ref="hitboxCreator"></canvas>
    </div>
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
import Flipbook from '@/lib/core/RenderedObject/Sprite/Flipbook';

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
    private hitbox: IHitBox = { id: Date.now(), from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
    private flipbook: Flipbook;

    mounted() {
      this.canvas = this.$refs.hitboxCreator as HTMLCanvasElement;
      this.ctx = (this.$refs.hitboxCreator as HTMLCanvasElement).getContext('2d');

      this.initDrawListeners();
    }

    saveHitbox() {
      if (this.hitboxes) this.$emit('saveHitbox', this.chosenSpriteIndex, this.hitboxes);
      this.hitboxes = [];
    }

    resetHitbox() {
      this.hitboxes = [];
      this.hitbox = { id: Date.now(), from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
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

    @Watch('hitbox', {
      deep: true,
    })
    protected redrawHitBox() {
      this.showChosenSprite();
      this.drawHitbox(this.hitbox);
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
    }

    onMouseMove(e: MouseEvent) {
      if (this.mousedown) {
        const { offsetX, offsetY } = e;
        const { x, y } = this.startPoint;
        this.showChosenSprite();
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
