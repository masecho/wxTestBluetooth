const Bluetooth = require("../../utils/bluetooth/bluetooth.js");
let App = getApp();

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    selectDeviceId:null,
    serviceIds: null,
    selectServiceId:null,
    chsConnect: null
  },
  // 开始扫描
  openBluetoothAdapter() {
    Bluetooth.openBluetoothAdapter()
      .then(() => {
        return Bluetooth.startBluetoothDevicesDiscovery();
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
  createBLEConnection(e){
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId: deviceId,
      success: (res) => {
        let title = deviceId + '连接成功！'
        wx.showToast({
          title: title
        })
        this.setData({
          connected: true,
          name: name,
          selectDeviceId: deviceId,
        })
        App.globalData.blueToothData.selectDeviceId = deviceId;
        this.getBLEDeviceServices(deviceId);
      }
    })
    this.stopBluetoothDevicesDiscovery();
    console.log('发现蓝牙设备：')
    console.log(this.data.devices)
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
  getServiceChsId(e) {
    const ds = e.currentTarget.dataset;
    const serviceId = ds.serviceId;
    const deviceId = ds.deviceId;
    this.getBLEDeviceCharacteristics(deviceId, serviceId);
  },
  // 获取设备的sevices的Characteristics特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        this.setData({
          chsConnect: res.characteristics
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
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      this.setData(data)
    })
  },
  writeBLECharacteristicValue() {

    let hex8Arr = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    let hex16Arr = new Uint16Array([0x0001, 0x0002]);
    let buffer = abUtil.u8arr2ab(hex8Arr);
    let buffer2 = abUtil.u16arr2ab(hex16Arr);
    let buffer3 = hex16Arr.buffer;
    let data = {
      deviceId: this._deviceId,
      serviceId: "00001111-0000-1000-8000-00805F9B34FB",
      // serviceId: this.data.serviceIds[0].uuid,
      characteristicId: this.data.chsConnect[0].uuid,
      value: buffer3,
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
    console.log(data);
    wx.writeBLECharacteristicValue(data);
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  // 停止蓝牙设备查找
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
})