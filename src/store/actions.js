// 5.通过action操作mutation来改变数据，而不是直接操作mutation
import * as types from './types.js'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utils'

// 点选歌曲
export function selectPlay({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 分情况判断当前是否是随机播放模式
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放模式
export function randomPlay({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 查找歌曲index
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
