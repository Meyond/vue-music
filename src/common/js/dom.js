// 类名添加
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

// 被点击对象的get/set函数
export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

// 浏览器能力检测
let elementStyle = document.createElement('div').style

// 自动执行返回当前浏览器的对应前缀
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    ms: 'msTransform',
    O: 'OTransform',
    standard: 'transform'
  }

  for (var key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixTransform(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }
  // 浏览器前缀加上样式名首字母大写后的字符串
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
