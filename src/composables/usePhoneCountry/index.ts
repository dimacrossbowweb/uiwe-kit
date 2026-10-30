// Maps international dialing prefix (digits only) to ISO 3166-1 alpha-2 country code.
// Sorted longest-first so the lookup uses the most specific match.
const PREFIX_MAP: Record<string, string> = {
  // +1 region — NANP (North America)
  '1': 'us',

  // +7 region — Kazakhstan uses 76x / 77x, rest is Russia
  '76': 'kz', '77': 'kz',
  '7': 'ru',

  // Europe
  '20': 'eg', '27': 'za',
  '30': 'gr', '31': 'nl', '32': 'be', '33': 'fr', '34': 'es',
  '36': 'hu', '39': 'it',
  '40': 'ro', '41': 'ch', '43': 'at', '44': 'gb', '45': 'dk',
  '46': 'se', '47': 'no', '48': 'pl', '49': 'de',
  '350': 'gi', '351': 'pt', '352': 'lu', '353': 'ie', '354': 'is',
  '355': 'al', '356': 'mt', '357': 'cy', '358': 'fi', '359': 'bg',
  '370': 'lt', '371': 'lv', '372': 'ee', '373': 'md', '374': 'am',
  '375': 'by', '376': 'ad', '377': 'mc', '378': 'sm',
  '380': 'ua', '381': 'rs', '382': 'me', '383': 'xk',
  '385': 'hr', '386': 'si', '387': 'ba', '389': 'mk',
  '420': 'cz', '421': 'sk', '423': 'li',
  '298': 'fo', '299': 'gl',

  // Americas
  '51': 'pe', '52': 'mx', '53': 'cu', '54': 'ar', '55': 'br',
  '56': 'cl', '57': 'co', '58': 've',
  '501': 'bz', '502': 'gt', '503': 'sv', '504': 'hn', '505': 'ni',
  '506': 'cr', '507': 'pa', '509': 'ht',
  '591': 'bo', '592': 'gy', '593': 'ec', '595': 'py',
  '597': 'sr', '598': 'uy',

  // Asia & Pacific
  '60': 'my', '61': 'au', '62': 'id', '63': 'ph', '64': 'nz',
  '65': 'sg', '66': 'th',
  '81': 'jp', '82': 'kr', '84': 'vn', '86': 'cn',
  '90': 'tr', '91': 'in', '92': 'pk', '93': 'af', '94': 'lk',
  '95': 'mm', '98': 'ir',
  '670': 'tl', '673': 'bn', '674': 'nr', '675': 'pg', '676': 'to',
  '677': 'sb', '678': 'vu', '679': 'fj', '680': 'pw',
  '682': 'ck', '685': 'ws', '686': 'ki', '687': 'nc', '688': 'tv',
  '689': 'pf', '691': 'fm', '692': 'mh',
  '850': 'kp', '852': 'hk', '853': 'mo', '855': 'kh', '856': 'la',
  '880': 'bd', '886': 'tw',
  '960': 'mv', '961': 'lb', '962': 'jo', '963': 'sy', '964': 'iq',
  '965': 'kw', '966': 'sa', '967': 'ye', '968': 'om', '970': 'ps',
  '971': 'ae', '972': 'il', '973': 'bh', '974': 'qa', '975': 'bt',
  '976': 'mn', '977': 'np',
  '992': 'tj', '993': 'tm', '994': 'az', '995': 'ge', '996': 'kg',
  '998': 'uz',

  // Africa
  '212': 'ma', '213': 'dz', '216': 'tn', '218': 'ly',
  '220': 'gm', '221': 'sn', '222': 'mr', '223': 'ml', '224': 'gn',
  '225': 'ci', '226': 'bf', '227': 'ne', '228': 'tg', '229': 'bj',
  '230': 'mu', '231': 'lr', '232': 'sl', '233': 'gh', '234': 'ng',
  '235': 'td', '236': 'cf', '237': 'cm', '238': 'cv', '239': 'st',
  '240': 'gq', '241': 'ga', '242': 'cg', '243': 'cd', '244': 'ao',
  '245': 'gw', '248': 'sc', '249': 'sd', '250': 'rw', '251': 'et',
  '252': 'so', '253': 'dj', '254': 'ke', '255': 'tz', '256': 'ug',
  '257': 'bi', '258': 'mz', '260': 'zm', '261': 'mg', '263': 'zw',
  '264': 'na', '265': 'mw', '266': 'ls', '267': 'bw', '268': 'sz',
  '269': 'km', '291': 'er',
}

// Descending by key length so the longest (most specific) prefix matches first.
const SORTED_PREFIXES = Object.keys(PREFIX_MAP).sort((a, b) => b.length - a.length)

/**
 * Brings a stored phone to the full international digit string ( "7…" ) that
 * ui-input-phone expects.
 *
 * Assumes a Russian (+7) numbering context: a bare 10-digit number, such as
 * "9774296748", is a Russian number without its country code. Fed as-is into a
 * mask whose first slot is the country code it would read as "+977…" (Nepal).
 * A domestic "8…" prefix is the same number dialled from inside Russia.
 * Anything else is assumed to be international already and left alone.
 *
 * @example
 *   toInternationalPhone( '9774296748' )    // '79774296748'
 *   toInternationalPhone( '8 977 429-67-48' ) // '79774296748'
 */
export function toInternationalPhone(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '')

  if (digits.length === 10) return '7' + digits
  if (digits.length === 11 && digits.startsWith('8')) return '7' + digits.slice(1)

  return digits
}

/**
 * Returns the ISO 3166-1 alpha-2 country code for a full international phone
 * number given as a digit string *including the country code* (e.g.
 * "79151234567" → "ru"). Note this is NOT ui-input-phone's modelValue when the
 * mask bakes in the country code (format "7_xxx…" stores only the national
 * digits) — prepend the fixed prefix first (see ui-input-phone).
 * Returns an empty string if no match is found.
 */
export function detectCountryByPhone(digits: string): string {
  if (!digits) return ''
  for (const prefix of SORTED_PREFIXES) {
    if (digits.startsWith(prefix)) return PREFIX_MAP[prefix] ?? ''
  }
  return ''
}
