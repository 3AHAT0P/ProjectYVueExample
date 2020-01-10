<template>
  <div id="app" :class="blockName | bemMods({theme: 'dark'})">
    <div class="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/editor">Editor</router-link> |
      <router-link to="/game">Game</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: { },
})
export default class App extends Vue {
  private mods: Hash = {};

  private blockName: string = 'app';
}
</script>

<style lang="stylus">
html,
body
  width 100%
  height 100%
  margin 0px

.app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  margin 0px

.nav
  height 16px
  border-bottom 1px solid black
  padding 8px 0
  margin-bottom 8px
</style>
