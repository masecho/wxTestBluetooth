// 打开蓝牙设备
const openBluetoothAdapter = () => {
  // 打开蓝牙设备
  return new Promise((resolve, reject) => {
    wx.openBluetoothAdapter({
      success: (res) => {      
        console.log('打开蓝牙成功', res)
        // 开始扫描
        // this.getBluetoothAdapterState();
        // this.startBluetoothDevicesDiscovery()
        resolve(res);
      },
      fail: (res) => {
        wx.showToast({
          title: '打开蓝牙失败'
        })
        reject(res);
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function(res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  })
};
// 开始搜索蓝牙设备
const startBluetoothDevicesDiscovery = (services, allowDuplicatesKey) => {

  return new Promise((resolve, reject) => {
    wx.startBluetoothDevicesDiscovery({
      services: services,
      allowDuplicatesKey: allowDuplicatesKey || false,
      success: (res) => {
        resolve(res);
        console.log('搜索周围设备成功', res);
      },
      fail: (res) => {
        wx.showToast({
          title: '搜索周围设备失败'
        })
        reject(res);
      }
    })
  })
};
// 停止蓝牙设备查找
const stopBluetoothDevicesDiscovery = () => {
  wx.stopBluetoothDevicesDiscovery()
};

//找到蓝牙设备之后
const onBluetoothDeviceFound = () => {
  return new Promise((resolve, reject) => {
    wx.onBluetoothDeviceFound((res) => {
      // res.devices.forEach(device => {
      //   if (!device.name && !device.localName) {
      //     return
      //   }
      //   const foundDevices = this.data.devices
      //   const idx = inArray(foundDevices, 'deviceId', device.deviceId)
      //   const data = {}
      //   if (idx === -1) {
      //     data[`devices[${foundDevices.length}]`] = device
      //   } else {
      //     data[`devices[${idx}]`] = device
      //   }
      //   this.setData(data);
      // })
      resolve(res.devices);
    })
  })
};

const inArray = (arr, key, val) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

module.exports = {
  inArray,
  openBluetoothAdapter,
  startBluetoothDevicesDiscovery,
  stopBluetoothDevicesDiscovery,
  onBluetoothDeviceFound
}