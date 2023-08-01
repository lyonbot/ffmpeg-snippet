export function nullIf<T>(val: T, val2: T): T | null {
  return val === val2 ? null : val
}
