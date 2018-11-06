const Bluetooth = require("../../utils/bluetooth/bluetooth.js");
const CRC16 = require("../../utils/bluetooth/crc16_ccitt.js");
const GetCMD = require("../../utils/bluetooth/bleCMD.js");
const md5 = require("../../miniprogram_npm/js-md5/index.js");
const arrbuffer = require('../../utils/bluetooth/arrbuffer.js')

let App = getApp();



Page({
  data: {
    devices: [],
    selectDeviceId: null,
    serviceIds: null,
    selectServiceId: null,
    chsConnect: null
  },
  onShow(){
    this.openBluetoothAdapter();
  },
  // 开始扫描
  openBluetoothAdapter() {
    Bluetooth.openBluetoothAdapter()
      .then(() => {
        return Bluetooth.startBluetoothDevicesDiscovery(['FFE0']);
      })
      .catch((res) => {
        console.log(res);
      })
      .then(() => {
        wx.onBluetoothDeviceFound((res) => {
          res.devices.forEach(device => {
            if (!device.name && !device.localName) {
              return;
            }
            const foundDevices = this.data.devices
            const idx = Bluetooth.inArray(foundDevices, 'deviceId', device.deviceId)
            const data = {}
            if (idx === -1) {
              data[`devices[${foundDevices.length}]`] = device
            } else {
              data[`devices[${idx}]`] = device
            }
            this.setData(data);
          })
        })
      })
  },

  // 建立连接
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset;
    const deviceId = ds.deviceId;
    const name = ds.name
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        let title = '连接成功！'
        wx.showToast({
          title: title
        })
        this.setData({
          connected: true,
          name: name,
          selectDeviceId: deviceId,
        })
        App.globalData.blueToothData.selectDeviceId = deviceId;      
      }
    })
    this.stopBluetoothDevicesDiscovery();
    console.log('发现蓝牙设备：')
    console.log(this.data.devices)
  },
  closeBLEConnection(e){
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        let title = '断开成功！'
        wx.showToast({
          title: title
        })
        this.setData({
          connected: false,
          name: null,
          selectDeviceId: null,
        })
        App.globalData.blueToothData.selectDeviceId = null;        
      }
    })
  },
  
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  // 停止蓝牙设备查找
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  goService(){
    if (!App.globalData.blueToothData.selectDeviceId){
      return;
    }
    wx.navigateTo({
      url: '../service/service',
    })
  }
})