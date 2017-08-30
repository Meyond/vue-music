<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend.prevent="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { prefixTransform } from 'common/js/dom'
// 播放进度焦点宽度
const progressBtnWidth = 16
const transform = prefixTransform('transform')

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    // 监视已播放时长占总时长比例，更新进度条
    percent(val) {
      if (val >= 0 && !this.touch.initiated) {
        // 进度条宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 已播放长度
        const offsetWidth = val * barWidth
        // 设置进度条偏移量
        this._offset(offsetWidth)
      }
    }
  },
  created() {
    this.touch = {}
  },
  methods: {
    progressTouchStart(e) {
      // 初始化
      this.touch.initiated = true
      // 点击位置横向坐标
      this.touch.startX = e.touches[0].pageX
      // 当前已播放进度
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        // 如果没有初始化touch而执行progressTouchMove，直接返回
        return
      }
      // 纵向偏移量，滑动了多少距离
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 拖动距离必须处于0到进度条最大长度之间
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth)
    },
    progressTouchEnd(e) {
      this.touch.initiated = false
      this._triggerPercent()
    },
    progressClick(e) {
      // this._offset(e.offsetX)
      /**
       * 点击progressBtn时e.offsetX值会出现问题
       * 在这里可以通过计算点击位置距离页面左边的距离再减去progress左外边距得到e.offset
       */
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)

      this._triggerPercent()
    },
    // 根据offsetWidth设置进度条偏移量
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    },
    // 根据拖动距离设置percent值派发到父组件，从而更新音乐播放进度
    _triggerPercent() {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
