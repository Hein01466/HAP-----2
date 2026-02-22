declare module 'json2csv' {
  export class Parser<T> {
    constructor(options: { fields: string[] })
    parse(rows: T[]): string
  }
}
