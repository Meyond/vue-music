<template>
  <div class="player" v-show="playList.length>0">
    <!-- 播放页面 -->
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdClass">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>
        <!-- 播放控制区 -->
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{currentTime | formatTime}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChange="onProgressBarChange" :percent="percent"></progress-bar>
            </div>
            <span class="time time-r">{{currentSong.duration | formatTime}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableClass">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableClass">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableClass">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 底部播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdClass" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control" @click.stop="togglePlaying">
          <progress-circle :radius="radius" :percent="percent">
            <i class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 当歌曲ready会触发canplay事件，同样歌曲发生错误会触发error事件,播放完毕会触发ended事件 -->
    <audio @canplay="ready" @error="error" ref="audio" :src="currentSong.url" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { prefixTransform } from 'common/js/dom'
import { formatTime, shuffle } from 'common/js/utils'
import { playMode } from 'common/js/config'
import Animations from 'create-keyframe-animation'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'

const transform = prefixTransform('transform')

export default {
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32
    }
  },
  computed: {
    ...mapGetters(['fullScreen', 'playList', 'currentSong', 'playing', 'currentIndex', 'mode', 'sequenceList']),
    percent() {
      // 已播放时长占比
      return this.currentTime / this.currentSong.duration
    },
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdClass() {
      return this.playing ? 'play' : 'play pause'
    },
    disableClass() {
      // 当歌曲没有准备好，按钮设置为disable样式(置灰)
      return this.songReady ? '' : 'disable'
    },
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    }
  },
  watch: {
    currentSong(newSong, oldSong) {
      // 如果要切换的歌曲的id和当前歌曲id相同，则继续播放
      if (newSong.id === oldSong.id) {
        return
      }
      // nextTick: 当DOM正在更新时，等待DOM更新完毕执行
      this.$nextTick(() => {
        this.$refs.audio.play()
      })
    },
    playing(flag) {
      // 根据state.playing的状态是否为true来播放和暂停歌曲
      const audio = this.$refs.audio
      this.$nextTick(() => {
        flag ? audio.play() : audio.pause()
      })
    }
  },
  methods: {
    ...mapMutations(['SET_FULL_SCREEN', 'SET_PLAYING_STATE', 'SET_CURRENT_INDEX', 'SET_PLAY_MODE', 'SET_PLAYLIST']),
    // 关闭播放页
    back() {
      this.SET_FULL_SCREEN(false)
    },
    open() {
      this.SET_FULL_SCREEN(true)
    },
    // 歌曲播放完毕时
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop() {
      // 将当前歌曲切到开始位置继续播放
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    },
    next() {
      // 点击下一曲，如果歌曲ready状态为false，直接返回不进行下一步操作，避免歌曲无法响应切换到下一曲而报错
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playList.length) {
        index = 0
      }
      this.SET_CURRENT_INDEX(index)
      // 切到下一曲playing切换为播放状态
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    prev() {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playList.length - 1
      }
      this.SET_CURRENT_INDEX(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    updateTime(e) {
      // 歌曲播放时间
      this.currentTime = e.target.currentTime
    },
    // 在钩子函数中使用js通过第三方插件create-keyframe-animation制作css3动画
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale()

      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }

      Animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          esing: 'linear'
        }
      })
      Animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      Animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}, ${y}, scale(${scale}))`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    ready() {
      this.songReady = true
    },
    error() {
      // 当前歌曲加载失败，让它也可以进行切换操作
      this.songReady = true
    },
    _getPosAndScale() {
      // 目标位置
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      // CD区域位置
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      // x y 轴上移动的距离
      const x = -((window.innerWidth / 2) - paddingLeft)
      const y = window.innerHeight - paddingTop - (width / 2) - paddingBottom

      return {
        x, y, scale
      }
    },
    onProgressBarChange(percent) {
      this.$refs.audio.currentTime = percent * this.currentSong.duration
      // 如果当前不是播放状态,拖动后播放
      if (!this.playing) {
        this.togglePlaying()
      }
    },
    togglePlaying() {
      this.SET_PLAYING_STATE(!this.playing)
    },
    changeMode() {
      // 三种播放模式 0 1 2
      const mode = (this.mode + 1) % 3
      this.SET_PLAY_MODE(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.SET_PLAYLIST(list)
    },
    /**
     * 切换成随机播放，当前播放歌曲不发生改变
     * findIndex为ES6语法，返回符合条件的元素的index
     */
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.SET_CURRENT_INDEX(index)
    }
  },
  filters: {
    formatTime
  },
  components: {
    ProgressBar,
    ProgressCircle
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        display: none
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
