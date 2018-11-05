// 蓝牙的命令发送
const BleConfig = require("./bleConfig.js");
const md5 = require("../../miniprogram_npm/js-md5/index.js");

const password = BleConfig.password;
const CMD_LIST = BleConfig.CMD_LIST;

const getCMDdata = (data,withpsw) => {
  data = data || [];
  if (withpsw){
    data = data.concat(password);
  } 
  let len = data.length;
  data.unshift(len);
  return data;
}

const getMD5 = (arr)=>{
  if(arr){
    return md5.array(arr).slice(0,4);
  }  
  return [0x00,0x00,0x00,0x00];
}

const getBlueToothCMD = (cmd,midData)=>{
  let headData = null;
  let isValidate = false;
  if (typeof cmd == 'string'){
    headData = CMD_LIST[cmd];
    isValidate =(cmd == 'connectValidate');
  }else{
    headData = cmd;
  }
  let _midData = getCMDdata(midData, isValidate);
  let needMD5Arr = [].concat(password,headData, _midData);
  let md5Arr = getMD5(needMD5Arr);
  return [].concat(headData, _midData, md5Arr);
}

module.exports = getBlueToothCMD;