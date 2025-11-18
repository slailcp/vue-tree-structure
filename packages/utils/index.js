// 防抖
export function debounce(fn, delay) {
  var timeout = null;
  return function () {
    var args = arguments
    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null
        fn.apply(this, args)
      }, delay)
    }
  }
}

export function deepclone(target) {
  target = target; //  || {}
  if (typeof target !== 'object' || target == null || target instanceof Date) {
    return target
  }
  var ret;
  if (target instanceof Array) {
    ret = []
  } else {
    ret = {}
  }

  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      ret[key] = deepclone(target[key])
    }
  }
  return ret;
}


