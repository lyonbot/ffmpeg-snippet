/**
 * ref: https://ffmpeg.org/ffmpeg.html
 * https://ffmpeg.org/ffmpeg-filters.html
 */

export interface FFmpegInput {
  path: string
  arguments?: Record<string, string | number>
}

export class FFmpegCommandLine {
  vf: string[] = []
  af: string[] = []
  others: Record<string, string | number> = {}
  inputs: FFmpegInput[] = []

  constructor() {

  }

  setInput(num: number, input: FFmpegInput) {
    this.inputs[num] = { arguments: {}, ...input }
  }

  /**
   * @param key - the argument without leading `-`
   */
  set(key: string, value: string | number | null | undefined) {
    let arrValue = () => value ? [String(value)] : [];

    if (key === 'vf') { this.vf = arrValue(); return }
    if (key === 'af') { this.af = arrValue(); return }

    if (value == null) delete this.others[key];
    else this.others[key] = value;
  }

  /**
   * compose the final command arguments
   * 
   * @example ["input.mp4", "-t", "100", "-vf", "scale=800:-1"]
   */
  toCommandArguments() {
    const result: string[] = []
    for (const [key, value] of Object.entries(this.others)) {
      result.push(`-${key}`, String(value))
    }

    const af = !this.others.an && this.af.join(', ')
    if (af) result.push('-af', af)

    const vf = !this.others.vn && this.vf.join(', ')
    if (vf) result.push('-vf', vf)

    // -----
    // add inputs

    this.inputs.forEach((input, index) => {
      const prepend: string[] = []
      for (const [key, value] of Object.entries(input.arguments || {})) {
        prepend.push(`-${key}`, String(value))
      }
      prepend.push('-i', input.path)
      result.unshift(...prepend)
    })

    return result
  }
}

/**
 * a simple string concat
 * 
 * @example
 *   filterExpr({ 'scale', { w: 800, h: 600 } })
 *   => "scale=w=800:h=600"
 */
export function filterExpr(filterName: string, options?: Record<string, any> | string | number | null | undefined) {
  let optionsString: string = ''
  if (options != null) {
    if (typeof options === 'object') {
      optionsString = Object.entries(options || {})
        .filter(([, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join(':')
    } else {
      optionsString = String(options)
    }
  }

  if (optionsString) return `${filterName}=${optionsString}`
  return filterName
}
