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

// 数组随机排列函数
export function shuffle(arr) {
  let _arr = arr.slice()
  for (var i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 返回一个max(包含max)和min之间的值
function getRandomInt(min, max) {
  let flag = Math.random() * (max - min + 1) + min
  return Math.floor(flag)
}
