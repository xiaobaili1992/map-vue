
export function throttle(func, wait, options = {}) {
  let timeout = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    const context = this;

    if (remaining <= 0 || remaining > wait) {
      if (previous === 0 && !leading) {
        previous = now;
        return;
      }

      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      func.apply(context, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}

export function debounce(func, wait) {
  let timeout = null;

  return function (...args) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
