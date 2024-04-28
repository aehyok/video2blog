/**
 * 根据当前环境获取可执行文件的路径
 * @returns 
 */
export const getExecutePath = () => {
  return process.platform === "win32" ? "win" : "mac";
}

/**
 * 区分window为exe可执行文件，mac和linux为文件名即可
 * @param name 
 * @returns 
 */
export const getExecuteFile = (name: string) => {
  return process.platform === "win32" ? `${name}.exe` : name;
}

/**
 * window环境下执行命令行汉子乱码需要授权
 * @returns 
 */
export const getAuthCmd = () => {
  return process.platform === "win32" ? `chcp 65001 &&` : "";
}