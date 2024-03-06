export class NumberUtil {
  public static parse(value: unknown, defaultValue = undefined) {
    const n = Number(value)
    return Number.isNaN(n)
      ? defaultValue
      : n
  }

  public static fromDate(value: number | string | Date) {
    const date = new Date(value)
    const n = date.getTime()
    return n
  }
}
