import { connect, get, run } from "./sqlite3";

/**
 * 链接sqlite3数据库
 * @param path 
 */
export const connectDataBase = async (path: string) => {
  await connect(path);
}

/**
 * 通过url查找数据库记录
 * @param url
 */
export const findRecord = async (url: string) => {
  const record = await get(
    `select * from ParsingVideo s where s.Path = ? and s.Env = ?`,
    [url, import.meta.env.MODE]
  );
  return record;
};

/**
 * 插入数据库记录
 * @param data
 */
export const insertRecord = async (data: any) => {
  const insertSql = `insert into ParsingVideo (Id, Title, Path, SourceSubtitles, TargetSubtitles, CreateTime, LocationVideoPath, FolderDate, Env, HasVtt, HasVideo, CoverImage) 
                     values ($Id, $Title, $Path, $SourceSubtitles, $TargetSubtitles, $CreateTime, $LocationVideoPath, $FolderDate, $Env, $HasVtt, $HasVideo, $CoverImage)`;
  return await run(insertSql, data);
};



/**
 * 插入键值对
 * @param data
 */
export const insertKeyValues = async (data: any) => {
  const insertSql = `insert into KeyValues (Id, Code, Value) 
                     values ($Id, $Code, $Value)`;
  return await run(insertSql, data);
};

/**
 * 修改键值对
 * @param data
 */
export const updateKeyValues = async (code: string, value: string) => {
  const updateSql = `
    UPDATE KeyValues
    SET Value = $1
    WHERE Id = $2
  `;
  return await run(updateSql, [value, code]);
};

/**
 * 通过Code来查找键值对
 * @param url
 */
export const findKeyValues = async (code: string) => {
  const record = await get(
    `select * from KeyValues s where s.Code = ?`,
    [code]
  );
  return record;
};