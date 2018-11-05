const crc16 = require('crc16_ccitt.js');
const crc16_u16arr = (pucBuf, length) => {
  let crcVal = crc16(pucBuf, length);
  return new Uint16Array([crcVal]);
};

const crc16_u8arr = (pucBuf, isreverse, length) => {
  let u16 = crc16_u16arr(pucBuf, length)
  let u8 = new Uint8Array(u16.buffer);
  return isreverse ? u8.reverse() : u8;
};
// 是否大端序isbigEndian（默认小端序）
const concatCRC16 = (pucBuf, isbigEndian, length) => {
  length = length || pucBuf.length;
  isbigEndian = isbigEndian || false;
  let crc16_value = crc16(pucBuf, length);
  let byte_len = length + 2;
  let buffer = new ArrayBuffer(byte_len);
  let view = new DataView(buffer);
  for (let i = 0; i < length; i++) {
    // 默认大端字节序
    view.setUint8(i, pucBuf[i]);
  }
  view.setUint16(length, crc16_value, !isbigEndian);
  return buffer;
};

module.exports = {
  crc16,
  crc16_u16arr,
  crc16_u8arr,
  concatCRC16
};