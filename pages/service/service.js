// pages/service/service.js
const Bluetooth = require("../../utils/bluetooth/bluetooth.js");
let App = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectDeviceId: null,
    serviceIds: []
  },
  onShow() {
    let selectDeviceId = App.globalData.blueToothData.selectDeviceId;
    this.setData({
      selectDeviceId: selectDeviceId
    })
    console.log(selectDeviceId);
    this.getBLEDeviceServices(selectDeviceId);
    console.log(11.15 + 111.67 + 102.2 + 41.25)
  },


  // 获取设备的sevices
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        this.setData({
          serviceIds: res.services
        })
        console.log("getBLEDeviceServices:");
        console.log(res.services);
      }
    })
  },
  goServiceId(e){
    const ds = e.currentTarget.dataset;
    const serviceId = ds.serviceId;
    App.globalData.blueToothData.selectServiceId = serviceId;
    wx.navigateTo({
      url: '../chs/chs',
    })
  }
})