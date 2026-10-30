import { type IDatetime } from '../../types/datetime'
import { Type } from '../type'

/**
 * Formats a Date against a moment-style pattern.
 *
 * This used to delegate to moment, but `useFormat` is imported by nearly every
 * component, so that put a hard `moment` import in the core bundle — breaking
 * the optional-peer contract for anyone who only wanted a button. Only three
 * moment calls were involved (validate, parse, format), so they are inlined.
 *
 * Supported tokens: YYYY YY MM M DD D HH H mm m ss s SSS.
 * Text inside [square brackets] is emitted literally.
 */
const TOKEN_PATTERN = /\[([^\]]*)\]|YYYY|YY|MM|M|DD|D|HH|H|mm|m|SSS|ss|s/g

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

export function formatDate(date: Date, format: string): string {
  return format.replace(TOKEN_PATTERN, (token: string, literal?: string) => {
    // A [literal] block captures its inner text; emit it untouched.
    if (literal !== undefined) return literal

    switch (token) {
      case 'YYYY':
        return String(date.getFullYear())
      case 'YY':
        return pad(date.getFullYear() % 100)
      case 'MM':
        return pad(date.getMonth() + 1)
      case 'M':
        return String(date.getMonth() + 1)
      case 'DD':
        return pad(date.getDate())
      case 'D':
        return String(date.getDate())
      case 'HH':
        return pad(date.getHours())
      case 'H':
        return String(date.getHours())
      case 'mm':
        return pad(date.getMinutes())
      case 'm':
        return String(date.getMinutes())
      case 'SSS':
        return pad(date.getMilliseconds(), 3)
      case 'ss':
        return pad(date.getSeconds())
      case 's':
        return String(date.getSeconds())
      default:
        return token
    }
  })
}

/** Accepts what `new Date()` accepts; returns null when the result is invalid. */
function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return isNaN(date.getTime()) ? null : date
}

export class Datetime extends Type implements IDatetime {
  value!: Date
  format!: string

  constructor(value: Date, format: string) {
    super('datetime')

    try {
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        throw new Error('[Datetime.constructor] :: invalid value')
      }

      if (typeof format !== 'string') {
        throw new Error('[Datetime.constructor] :: invalid format')
      }

      this.value = value
      this.format = format
    } catch (e: unknown) {
      console.error(e)
    }
  }

  static validate(value: string | number | Date): boolean {
    return toDate(value) !== null
  }

  static parse(
    value: string | number | Date = new Date(),
    format: string = 'DD.MM.YYYY'
  ): IDatetime {
    const date = toDate(value)

    if (!date) {
      throw new Error('[Datetime.parse] invalid value')
    }

    return new Datetime(date, format)
  }

  toString(): string {
    return formatDate(this.value, this.format)
  }
}
