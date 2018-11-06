// 解析蓝牙的回复
const BleConfig = require("./bleConfig.js");
const password = BleConfig.password;
const PARSE_LIST = BleConfig.PARSE_LIST;
const md5 = require("../../miniprogram_npm/js-md5/index.js");
const arrbuffer = require("arrbuffer.js");

const getResponseCRC16 = (u8arr) => {
  let len = u8arr.length;
  let result = u8arr.slice(len - 2);
  return result;
}
const getResponseMD5 = (u8arr, isConnectValidate) => {
  let len = u8arr.length;
  let arr = u8arr.slice(len - 7, len - 3);
  let result = isConnectValidate ? (new Uint8Array()) : arr;
  return result;
}

const getResponseData = (u8arr, isConnectValidate) => {
  let len = u8arr.length;
  let end = isConnectValidate ? len - 2 : len - 6
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

const parseData = (cmdType, res) => {
  let len = res[0];
  let status = res[1];
  let data = {
    cmdType: cmdType,
    len: res[0],
    u8: res.slice(1),
    status: res[1]
  }
  let result = {};
  switch (cmdType) {
    case "connectValidate":
      result = data;
      break;

    case "queryAllLockState":
      result = data;
      result.state = res[2];
      result.isNormal = (res[2] == 1);
      break;

    case "queryLockState":
      result = data;
      let stateNum = parseInt(res[2]);
      result.state = BleConfig.lockState[stateNum];
      result.RFID = arrbuffer.u8arr2str(res.slice(3, 5));
      break;

    case "cmdOpenSingleLock":
      result = data;
      result.RFID = arrbuffer.u8arr2str(res.slice(2, 4));
      break;
  }
  return result;
}

const parseResponse = (arr) => {
  let u8arr = null;
  if (arr instanceof Uint8Array) {
    u8arr = arr;
  } else if (arr instanceof ArrayBuffer) {
    u8arr = new Uint8Array(arr);
  } else {
    return;
  }
  let CRC16Data = getResponseCRC16(u8arr);
  let cmdData = getResponseCMD(u8arr);
  let cmdType = getResponseCMDType(cmdData);
  let withOutMD5 = (cmdType === "connectValidate");
  let res = getResponseData(u8arr, withOutMD5);
  let MD5Data = getResponseMD5(u8arr, withOutMD5);

  return {
    u8: {
      total: u8arr,
      crc16: CRC16Data,
      md5: MD5Data
    },
    res: arrbuffer.u8arr2str(u8arr),
    crc16: arrbuffer.u8arr2str(CRC16Data),
    md5: arrbuffer.u8arr2str(MD5Data),
    data: parseData(cmdType, res)
  }
}

module.exports = parseResponse;