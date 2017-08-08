// 手动封装jsonp方法
import originJSONP from 'jsonp'

// 对外暴露一个jsonp函数
export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  // 返回一个promise函数
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      // 回调函数容错处理
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}
