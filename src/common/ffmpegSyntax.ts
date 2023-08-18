/**
 * If `val == val2`, return null, otherwise return `val`
 *
 * useful to output short commands and filter expressions
 */
export function ee<T>(val: T, val2: T): T | null {
  return val === val2 ? null : val;
}

/**
 * a simple string joiner for ffmpeg filter expression
 *
 * @example
 *   filter('scale', { w: 800, h: 600 })
 *   => "scale=w=800:h=600"
 *
 *   filter('scale', 2)
 *   => "scale=2"
 *
 *   filter('scale', null)
 *   => "scale"
 */
export function filter(filterName: string, options?: Record<string, any> | string | number | null | undefined) {
  let optionsString: string = "";
  if (options != null) {
    if (typeof options === "object") {
      optionsString = Object.entries(options || {})
        .filter(([, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join(":");
    } else {
      optionsString = String(options);
    }
  }

  if (optionsString) return `${filterName}=${optionsString}`;
  return filterName;
}
