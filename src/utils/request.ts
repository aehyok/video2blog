import axios from "axios"
import { useStorage } from "@vueuse/core";
/**
 * 生成二维码
 * @returns 
 */
export const createQrCode = async() => {
  return await axios.get("https://api.mdnice.com/wechat/qrcode");
}

/**
 * 检查登录状态
 * @param sceneStr  
 * @returns 
 */
export const checkLogin = async(sceneStr: string) => {
  return await axios.post("https://api.mdnice.com/wechat/checkLogin", {
    sceneStr
  });
}

/**
 * 获取用户信息
 * @returns 
 */
export const getUserSelf = async() => {
  const cacheToken = useStorage("token", {});
  console.log(cacheToken, "cacheToken")
  if(cacheToken.value !=null) {
    // tokenObject = JSON.parse(token);
    // console.log(tokenObject, "tokenObject")
    // return await axios.get("https://api.mdnice.com/user/self", {
    //   headers: {
    //     Authorization: `Bearer ${tokenObject.token}`
    //   }
    // });
  }
}

/**
 * 上传文件接口
 * @param file 
 * @returns 
 */
export const upload = (file: string) => {
  let formData: any = toFormData(file);

  const cacheToken: any = useStorage("token", {});
  console.log(cacheToken, "cacheToken")
  if(cacheToken.value !=null) {
    return axios.post("https://api.mdnice.com/file/user/upload", formData, {
      headers: {
        Authorization: `Bearer ${cacheToken.value.token}`,
        "Content-Type": "multipart/form-data"
      },
    });
  }
}

/**
 * base64 转换为二进制
 * @param base64 
 * @returns 
 */
const base64ToBinary = (base64: string) => {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return binaryToBlob(bytes.buffer,"image/png");
}


// 将二进制数据转换为Blob对象
function binaryToBlob(binary: any, type: string) {
  return new Blob([new Uint8Array(binary)], {type: type});
}



/**
 * base64 转为Blob
 * @param base64Data 
 * @returns 
 */
function base64ToBlob(base64Data: string) {
  const dataArr = base64Data.split(','); // 根据,来分隔
  
  const imageType = dataArr[0].match(/:(.*?);/)[1]; // 获取文件类型。使用正则捕获 image/jpeg
  
  const textData = window.atob(dataArr[1]); // 使用atob() 将base64 转为文本文件
  const arrayBuffer = new ArrayBuffer(textData.length); // 创建一个二进制数据缓冲区，可以理解为一个数组
  const uint8Array = new Uint8Array(arrayBuffer); // 创建一个类型化数组对象，可以理解为上面的数组的成员，给这个对象赋值就会放到上面的数组中。
  for(let i = 0; i < textData.length; i++) {
   uint8Array[i] = textData.charCodeAt(i); // 将文本文件转为UTF-16的ASCII, 放到类型化数组对象中
   }
  
  return [new Blob([arrayBuffer], { type: imageType }), imageType.slice(6)]; // 返回两个值，一个Blob对象，一个图片格式（如jpeg）
 }

 /**
  * 转为formData
  * @param base64Data 
  * @returns 
  */
function toFormData(base64Data: string) {
  const [imageBlob, imageType] = base64ToBlob(base64Data);  // 获取处理好的Blob 和文件类型
  const formData = new FormData();
  formData.append('file', imageBlob, `${Date.now()}.${imageType}`); // 添加到表单，传入文件名
  return formData;
}
 