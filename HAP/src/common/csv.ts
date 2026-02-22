import { Parser } from 'json2csv'

export function toCsv<T extends Record<string, unknown>>(rows: T[], fields: string[]) {
  const parser = new Parser({ fields })
  return parser.parse(rows)
}
