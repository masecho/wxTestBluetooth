// pages/characters/characters.js
const Bluetooth = require("../../utils/bluetooth/bluetooth.js");
const ArrBuffer = require("../../utils/bluetooth/arrbuffer.js");
const CRC16 = require("../../utils/bluetooth/crc16.js");
const GetCMD = require("../../utils/bluetooth/bluetoothCMD.js")
const BluetoothParse = require("../../utils/bluetooth/bluetoothParse.js");
let App = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectDeviceId: null,
    selectServiceId: null,
    characters: [],
    sendValue:"",
    checkedHex:true,
    checkedCRC16:false
  },
  onShow: function() {
    let selectDeviceId = App.globalData.blueToothData.selectDeviceId;
    let selectServiceId = App.globalData.blueToothData.selectServiceId;
    this.setData({
      selectDeviceId: selectDeviceId,
      selectServiceId: selectServiceId
    });
    this.getBLEDeviceCharacteristics(selectDeviceId, selectServiceId);

  },
  clearRev(e) {
    let data={};
    let index = e.currentTarget.dataset.index;
    let uuid = e.currentTarget.dataset.uuid; 
    data[`characters[${index}]`] = {
      uuid: uuid,
      value: []
    }
    this.setData(data);
  },
  // 获取设备的sevices的Characteristics特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        this.setData({
          characters: res.characteristics
        })
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        // console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const index = Bluetooth.inArray(this.data.characters, 'uuid', characteristic.characteristicId)
      const data = {}
      if (index === -1) {
        return;
      }

      let value = this.data.characters[index]['value'] || [];
      value.push(ArrBuffer.ab2U8str(characteristic.value));
      data[`characters[${index}]`] = {
        uuid: characteristic.characteristicId,
        value: value
      }
      this.setData(data);
      console.log(BluetoothParse(value));
    });
  },
  
  sendChsValue(e){
 
    let uuid = e.currentTarget.dataset.uuid; 
    let str = this.data.sendValue; 
    if(!str){
      return;
    }
    let buffer; 

    if(this.data.checkedHex){
      buffer = ArrBuffer.char2hex(str).buffer;
    }else{
      buffer = ArrBuffer.string2ab(str);
    }

    if (this.data.checkedCRC16){
      let bufArr = new Uint8Array(buffer);
      buffer = CRC16.concatCRC16(bufArr);
    }  
    this.writeBLECharacteristicValue(uuid, buffer)
  },
  // 校验
  validate(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue; 
    let cmd = GetCMD("connectValidate");
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr,true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  // 查询锁状态00
  queryLockState0(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryLockState", [0x00]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  // 查询锁状态01
  queryLockState1(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryLockState",[0x01]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  // 查询锁状态02
  queryLockState2(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryLockState", [0x02]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  // 查询锁状态03
  queryLockState3(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryLockState", [0x03]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //查询所有锁锁死状态，回复01代表激活正常，00代表锁死（默认01）
  queryAllLockState(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryAllLockState");
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //查询电池电量
  queryBatteryState(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryBatteryState");
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //锁死所有锁
  cmdLockAll(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdLockAll",[0x00]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //打开所有所
  cmdopenAll(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdLockAll", [0x01]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //打开一个锁（请求借车）请求00
  cmdOpenSingleLock0(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x00]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //打开一个锁（请求借车）请求01
  cmdOpenSingleLock1(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x01]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //打开一个锁（请求借车）请求02
  cmdOpenSingleLock2(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x02]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  cmdOpenSingleLock3(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x03]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  cmdOpenSingleLock4(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x04]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  cmdOpenSingleLock5(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x05]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  cmdOpenSingleLock6(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x06]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  cmdOpenSingleLock7(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdOpenSingleLock", [0x07]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约借车00
  cmdReserveCart00(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveCart", [0x00]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约借车01
  cmdReserveCart01(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveCart", [0x01]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约借车02
  cmdReserveCart02(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveCart", [0x02]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },


    //取消预约借车00
  cmdCancelReserveCart(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdCancelReserveCart", [0x00]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约还车00
  cmdReserveBack00(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveBack", [0x00, 0x72, 0x7F]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约还车01
  cmdReserveBack01(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveBack", [0x01, 0x53, 0x9e]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约还车02
  cmdReserveBack02(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveBack", [0x02, 0x41, 0x22]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //预约还车03
  cmdReserveBack03(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdReserveBack", [0x03, 0x4c, 0xd5]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },

  //取消预约还车02
  cmdCancelReserveBack02(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdCancelReserveBack", [0x02, 0x41, 0x22]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },



  //取消预约还车03
  cmdCancelReserveBack03(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdCancelReserveBack",[0x03, 0x41, 0x22]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  }, 
   //手动还车00
  cmdHandleLockBack00(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdHandleLockBack", [0x72, 0x7f]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //手动还车01
  cmdHandleLockBack01(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdHandleLockBack", [0x53, 0x9e]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //手动还车02
  cmdHandleLockBack02(e) {
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("cmdHandleLockBack", [0x41, 0x22]);
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
 
  //获取GPS位置信息
  GPSLocation(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("GPSLocation");
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //获取主锁Id
  queryModuleId(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryModuleId");
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  //查询主锁运行模式
  queryModuleRunMode(e){
    let uuid = e.currentTarget.dataset.uuid;
    let str = this.data.sendValue;
    let cmd = GetCMD("queryModuleRunMode");
    let arr = new Uint8Array(cmd);
    let bufArr = new Uint8Array(arr.buffer);
    let buffer = CRC16.concatCRC16(bufArr, true);
    this.writeBLECharacteristicValue(uuid, buffer);
  },
  writeBLECharacteristicValue(uuid, buffer) {  
    let data = {
      deviceId: this.data.selectDeviceId,
      serviceId: this.data.selectServiceId,    
      characteristicId: uuid,
      value: buffer,
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.log(res)
      },
      complete: (res) => {
        console.log(res)
      }
      
    }
    console.log(ArrBuffer.ab2U8str(buffer));
     wx.writeBLECharacteristicValue(data);
  },
  bindKeyInput(e){
    this.setData({
      sendValue: e.detail.value
    })
  },
  checkHex(e) {
    this.setData({
      checkedHex: e.detail.value[0] ? true : false
    })
  },
  checkCRC16(e) {
    this.setData({
      checkedCRC16: e.detail.value[0] ? true : false
    })
  },
 
})