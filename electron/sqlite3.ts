import {
  type Database,
  verbose,
} from 'sqlite3'

const TAG = '[sqlite3]'
let database: Promise<Database>

export function getSqlite3(filename: string) {
  return database ??= new Promise<Database>((resolve, reject) => {
    const db = new (verbose().Database)(filename, error => {
      if (error) {
        console.log(TAG, 'main initialize failed :(')
        console.log(TAG, error)
        reject(error)
      } else {
        console.log(TAG, 'main initialize success :)')
        console.log(TAG, filename)
        resolve(db)
      }
    })
  })
}
