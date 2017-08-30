// 1.使用vuex首先定义state功能模块所需数据
import { playMode } from 'common/js/config'

const state = {
  // 歌手
  singer: {},
  // 播放状态
  playing: false,
  // 播放器全屏
  fullScreen: false,
  // 播放列表
  playList: [],
  // 顺序列表
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前歌曲索引
  currentIndex: -1

}

export default state
