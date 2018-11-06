// pages/babycart/babycart.js
const Bluetooth = require("../../utils/bluetooth/bluetooth.js");
const bleCMD = require("../../utils/bluetooth/bleCMD.js");
const arrbuffer = require('../../utils/bluetooth/arrbuffer.js');
const BleConfig = require('../../utils/bluetooth/bleConfig.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    device: null,
    deviceId: null,
    connected: false,
    total: 8,
    tempBuffer: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  onShow() {
    this.openBluetoothAdapter();
  },
  // 开始扫描
  openBluetoothAdapter() {
    Bluetooth.openBluetoothAdapter()
      .then(() => {
        return Bluetooth.startBluetoothDevicesDiscovery([BleConfig.UUID.serviceId]);
      })
      .catch((res) => {

      })
      .then(() => {
        wx.onBluetoothDeviceFound((res) => {
          res.devices.forEach(device => {
            if (!device.name && !device.localName) {
              return;
            }
            if (/xlse/.test(device.name) && device.advertisServiceUUIDs) {
              this.setData({
                device: device,
                deviceId: device.deviceId
              })
              this.createBLEConnection();
            }
          })
        })
      })
  },

  // 建立蓝牙连接
  createBLEConnection() {
    let deviceId = this.data.deviceId;
    let _this = this;
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        let title = '连接成功！'
        _this.notifyChChange(_this.data.deviceId);
        wx.showToast({
          title: title
        })
      }
    })
    wx.stopBluetoothDevicesDiscovery();
  },
  // 开启通知
  notifyChChange(deviceId) {
    let serviceId = BleConfig.UUID.serviceId;
    let characteristicId = BleConfig.UUID.characteristicId;
    let _this = this;
    wx.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId,
      characteristicId,
      state: true,
      success: () => {
        _this.onBleMessage();
        _this.bleConValidate();
        wx.showToast({
          title: '开启通知！'
        })

      }
    })
  },
  // 监听蓝牙数据
  onBleMessage() {
    wx.onBLECharacteristicValueChange((cha) => {
      if (cha.characteristicId != BleConfig.UUID.characteristicId) {
        return;
      }

      let res = bleCMD.bleParse(cha.value);

      switch (res.data.cmdType) {
        // 连接验证
        case "connectValidate":
          if (res.data.status == 0) {
            this.setData({
              connected: true
            })
            if (this.data.tempBuffer) {
              this.bleSendMessage(this.data.tempBuffer);
              this.setData({
                tempBuffer: null
              })
            }
            wx.showToast({
              title: '验证通过'
            })
          }
          break;
          // 查询锁状态
        case "queryLockState":
          if (res.data.status == 0) {
            wx.showToast({
              title: res.data.state
            })
          }
          break;

          // 查询所有锁状态
        case "queryAllLockState":
          if (res.data.status == 0) {
            wx.showToast({
              title: res.data.isNormal ? '正常' : "锁死"
            })
          }
          break;

          // 打开一个锁
        case "cmdOpenSingleLock":
          console.log(res)
          wx.showToast({
            title: res.data.code + (res.data.RFID || '')
          })
          break;
      }
    });
  },
  // 连接校验 
  bleConValidate() {
    let buffer = bleCMD.getBleTotalCMD("connectValidate");
    this.bleSendMessage(buffer);
  },
  // 查询锁状态
  queryLockState(e) {
    let num = parseInt(e.currentTarget.dataset.index) || 0;
    let buffer = bleCMD.getBleTotalCMD("queryLockState", [num]);
    this.bleSendMessage(buffer);
  },

  // 查询所有锁状态
  queryLockAllState() {
    let buffer = bleCMD.getBleTotalCMD("queryAllLockState");
    this.bleSendMessage(buffer);
  },

  //打开一个锁
  cmdOpenSingleLock(e) {
    let num = parseInt(e.currentTarget.dataset.index) || 0;
    let buffer = bleCMD.getBleTotalCMD("cmdOpenSingleLock", [num]);
    this.bleSendMessage(buffer);
  },

  // 发送蓝牙消息
  bleSendMessage(buffer) {
    let serviceId = BleConfig.UUID.serviceId;
    let characteristicId = BleConfig.UUID.characteristicId;
    let _this = this;
    let data = {
      deviceId: this.data.deviceId,
      serviceId,
      characteristicId,
      value: buffer,
      success: (res) => {

      },
      fail: (res) => {
        _this.setData({
          tempBuffer: buffer
        })
        _this.createBLEConnection();
      },
      complete: (res) => {

      }
    }

    wx.writeBLECharacteristicValue(data);
  }
})