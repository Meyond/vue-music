// 格式化音乐播放时间
export function formatTime(interval) {
  // |向下取整相当于Math.floor()
  interval = interval | 0
  const minute = interval / 60 | 0
  const second = _pad(interval % 60 | 0)

  return `${minute}:${second}`
}

// 秒数补位
function _pad(num, n = 2) {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num
    len++
  }
  return num
}
