import { type Database, verbose } from "sqlite3";

const sqlite = verbose();

let database: Database;

// 连接数据库
export function connect(path: string) {
  return new Promise((resolve, reject) => {
    database = new sqlite.Database(path, (err) => {
      if (err === null) {
        resolve(err);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * 运行sql
 * @param sql
 * @param params
 * @returns
 */
export function run(sql: string, params: any) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, (err: any, data: any) => {
      if (err === null) {
        console.log(err, "run-resolve-redner");
        resolve(data);
      } else {
        console.log(err, "run-reject-redner");
        reject(err);
      }
    });
  });
}

/**
 * 运行多条sql
 * @param sql
 * @returns
 */
export function exec(sql: string) {
  return new Promise((resolve, reject) => {
    database.exec(sql, (err) => {
      if (err === null) {
        resolve(err);
      } else {
        reject(err);
      }
    });
  });
}
/**
 * 查询一条数据
 * @param sql
 * @param params
 * @returns
 */
export function get(sql: string, params: any) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
/**
 * 查询所有数据
 * @param sql
 * @param params
 * @returns
 */
export function all(sql: string, params: any[]) {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * 关闭数据库
 */
export function close() {
  database.close();
}
