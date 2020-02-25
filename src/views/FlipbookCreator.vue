<template>
  <div :class="blockName | bemMods(mods)">
    <div>
      <label>
        Load flipbbok
        <input v-model="flipbookUrl">
      </label>
      <button @click="loadFlipbook">Load</button>
    </div>
    <div>
      <button @click="showAnimationTab">Animation Settings</button>
      <button @click="showHitBoxTab">Hitbox Settings</button>
    </div>
    <div :class="blockName | bemElement('content')">
      <div v-show="animation" :class="blockName | bemElement('animation-settings')">
        <div :class="blockName | bemElement('sprites')">
          <button @click="addFrame">Add frame</button>
          <p>You can change the order of sprites just dragging...</p>
          <div :class="blockName | bemElement('sprite-list')">
            <draggable v-model="spritesOptions">
              <div
                :class="blockName | bemElement('sprite-list-item')"
                v-for="(sprite, index) in spritesOptions"
                v-bind:key="sprite.id"
              >
                <label>
                  Sprite #{{index}}
                  <input v-model="sprite.sourceURL">
                </label>
                <button @click="showSpriteByUrl(sprite.sourceURL)">Show this Sprite</button>
              </div>
            </draggable>
          </div>
        </div>
        <div :class="blockName | bemElement('flipbook')">
          <FlipBookRenderer
            :flipBook="flipbook"
            :shownSpriteIndex="shownSpriteIndex"
          />
        </div>
      </div>
      <div v-show="!animation" :class="blockName | bemElement('hitbox-settings')">
        <HitboxCreator
          :flipbook="flipbook"
          :sprites="spritesOptions"
          @saveHitbox="addHitBox"
        />
      </div>
    </div>
    <div>
      <label>
        Enter flipbook name
        <input v-model="flipbookName">
      </label>
      <button @click="saveFlipBook">Save Flipbook</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import * as draggable from 'vuedraggable';

import { uuid } from '@/utils';
import Flipbook from '@/lib/core/RenderedObject/Sprite/Flipbook';
import Sprite, { ISpriteMeta } from '@/lib/core/RenderedObject/Sprite/Sprite';
import { IHitBox } from '@/lib/core/HitBox/HitBox';
import HitboxCreator from '@/components/HitboxCreator.vue';
import FlipBookRenderer from '@/components/FlipBookRenderer.vue';

const { BASE_URL } = process.env;

  @Component({
    components: { FlipBookRenderer, HitboxCreator, draggable },
  })
export default class FlipbookCreator extends Vue {
    private mods: Hash = {};
    private sprites: Sprite[] = [];
    private spritesOptions: ISpriteMeta[] = [];
    private flipbook: Flipbook = null;
    private flipbookName: string = '';
    private flipbookUrl: string = '/flipbooks/knightFlipbook.json';

    private blockName: string = 'flipbook-creator';

    private animation: boolean = true;
    private shownSpriteIndex: number = null;

    addFrame() {
      this.spritesOptions.push({
        sourceURL: '',
        id: uuid(),
        name: '',
        version: '0.1.0',
        sourceBoundingRect: {
          x: 0, y: 0, width: 0, height: 0,
        },
        hitBoxes: [{ id: this.spritesOptions.length, from: { x: 0, y: 0 }, to: { x: 0, y: 0 } }],
      });
    }

    addHitBox(chosenSpriteIndex: number, hitBoxes: IHitBox[]) {
      const sprite = this.spritesOptions[chosenSpriteIndex];
      sprite.hitBoxes = hitBoxes;
    }

    showSpriteByUrl(url: string) {
      if (url) {
        this.shownSpriteIndex = this.spritesOptions.findIndex(s => s.sourceURL === url);
      }
    }

    @Watch('spritesOptions', {
      deep: true,
    })
    protected async onSpitesChanged(newSprites: ISpriteMeta[]): Promise<void> {
      const spritesWithUrl = newSprites.filter(sprite => sprite.sourceURL);
      if (spritesWithUrl.length) {
        try {
          this.flipbook = await Flipbook.create({
            spriteMetaList: spritesWithUrl,
            repeat: true,
            frameDuration: 100,
          });
        } catch (e) {
          this.flipbook = null;
        }
      }
    }

    private showAnimationTab() {
      this.animation = true;
    }

    private showHitBoxTab() {
      this.animation = false;
    }

    saveFlipBook() {
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);

      const blob = new Blob([JSON.stringify(this.spritesOptions)], { type: 'application/json' });
      a.href = URL.createObjectURL(blob);
      a.download = `${this.flipbookName}.json` || 'flipbook.json';
      a.click();
      URL.revokeObjectURL(a.href);

      a.remove();
    }

    async loadFlipbook() {
      try {
        this.spritesOptions = await (await fetch(this.flipbookUrl)).json();
        await this.onSpitesChanged(this.spritesOptions);
      } catch (e) {
        console.error('Invalid flipbook url');
      }
    }
}
</script>

<style lang="stylus" scoped>
  .flipbook-creator
    width 100%
    display grid
    display flex
    flex-direction column
    &__animation-settings
      display flex
      justify-content space-between
      width 100%
      padding 20px
      margin-top 10px
    &__content
      display flex
    &__sprite-list
      display flex
      flex-direction column
    &__flipbook
      display flex
      flex-direction column
    &__flipbook canvas, &__hitbox-settings canvas
      border 1px solid
    &__hitbox-settings
      width 100%
    &__sprite-list-item
      padding 10px 0
</style>
