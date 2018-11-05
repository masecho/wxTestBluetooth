// 解析蓝牙的回复
const BleConfig = require("./bleConfig.js");
const password = BleConfig.password;
const PARSE_LIST = BleConfig.PARSE_LIST;
const md5 = require("../../miniprogram_npm/js-md5/index.js");

const getResponseCRC16 = (u8arr) => {
  return u8arr.slice(0, -2);
}
const getResponseMD5 = (u8arr) => {
  return u8arr.slice(-2, -6);
}

const getResponseData = (u8arr, isConnectValidate) => {
  let end = isConnectValidate ? -2 : -6
  return u8arr.slice(2, end);
}

const getResponseCMD = (u8arr) => {
  return u8arr.slice(0, 2);
}

const getResponseCMDType = (cmdData) => {
  for (let item in PARSE_LIST) {
    if (PARSE_LIST[item].join() == cmdData.join()) {
      return item;
      break;
    }
  }
}

const parseResponse = (u8arr) => {
  let CRC16Data = getResponseCRC16(u8arr);
  let MD5Data = getResponseMD5(u8arr);
  let cmdData = getResponseCMD(u8arr);
  let cmd = getResponseCMDType(cmdData);
  let isConnectValidate = (cmd == BleConfig.connectValidate);
  let res = getResponseData(u8arr, isConnectValidate);
  return {
    crc16: CRC16Data,
    md5: MD5Data,
    cmd: cmd,
    res: res
  }
}

module.exports = parseResponse;