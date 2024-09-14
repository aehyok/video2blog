import fs from "fs-extra";
import axios from "axios"
import { load } from 'cheerio';
export const getHtml = async (url: string) => {
  const headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Cookie":"ttwid=1%7CvTkBP44ArWgmQZy3zg50YxuOfy_snhRVN4MFF7PjnBI%7C1726297701%7C2e8f9c1c2d7a0de1413d51367124d23bf330662920ea4dc2866c92d3ef2b5df3;"
  }

  console.log(url, "get-response-toutiao")
  const response = await axios.get(url,{headers});
  console.log(response, "toutiao-response")
  let $ = load(response.data);
  let json = $("#RENDER_DATA").html();
  let title = $("title").html();
  console.log(title, "json-title");
  if(json) {
    return {
      title: title ?? "",
      json: decodeURIComponent(json)
    }
  }
  return {
    title: title?? "", 
    json: ""
  };
}

/**
 * 获取package.json的版本号
 * @returns 
 */
export const getPackageJsonVersion = () => {
  const packageJson = fs.readJsonSync("./package.json");
  return packageJson.version
}
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

