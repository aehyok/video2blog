import {
  type Database,
  verbose,
} from 'sqlite3'

const sqlite = verbose()

let database: Database

  // 连接数据库
export function connect(path: string) {
  return new Promise((resolve,reject) => {
    database = new sqlite.Database(path, (err) => {
      if(err === null) {
        resolve(err)
      } else {
        reject(err)
      }
    })
  })
}

// 运行sql
export function run(sql: string, params: any) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, (err: any) => {
      if(err === null) {
        console.log(err, "run-resolve-error")
        resolve(err)
      } else {
        console.log(err, "run-reject-error")
        reject(err)
      }
    })
  })
}

// 运行多条sql
export function exec(sql: string) {
  return new Promise((resolve, reject) => {
    database.exec(sql, (err) => {
      if(err === null) {
        resolve(err)
      } else {
        reject(err)
      }
    })
  })
}
// 查询一条数据
export function get(sql: string, params: any) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, data) => {
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
// 查询所有数据
export function  all(sql: string, params: any[]) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, data) => {
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
// 关闭数据库
export function  close() {
  database.close()
}
