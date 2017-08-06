<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <router-view></router-view>
  </div>
</template>

<script>
import mHeader from 'components/m-header/m-header'
import tab from 'components/tab/tab'

export default {
  name: 'app',
  components: {
    mHeader,
    tab
  }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'

#app
  // font-family: 'Avenir', Helvetica, Arial, sans-serif;
  // -webkit-font-smoothing: antialiased;
  // -moz-osx-font-smoothing: grayscale;
  color: #color-theme
</style>
