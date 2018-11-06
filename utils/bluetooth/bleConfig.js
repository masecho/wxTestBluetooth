const UUID = {  
  serviceId:'0000FFE0-0000-1000-8000-00805F9B34FB',
  characteristicId:'0000FFE1-0000-1000-8000-00805F9B34FB'
};

const password = [0x11, 0x22];

const lockState = ['isClosed', 'isPreborrow', 'isOpen', 'isPreback'];
const errCode = ['success', 'fail', 'isOpen', 'lenErr', 'crcErr','isPreback','timeout','111','operErr'];

const CMD_LIST = {
  // 查询主锁Id
  queryModuleId: [0x90, 0x01],
  //查询主锁运行模式（正常模式与运维模式）
  queryModuleRunMode: [0x90, 0x14],
  // 连接验证
  connectValidate: [0xD0, 0x1D],
  //查询锁状态信息
  queryLockState: [0x90, 0x15],
  // 查询所有锁锁死状态，正常或者锁死
  queryAllLockState: [0x90, 0x16],
  //查询电池状态，包括是否充电与电量百分比
  queryBatteryState: [0x90, 0x17],
  //锁死或者打开所有锁，带数据[0x00]锁死所有锁，带数据[0x01]打开所有锁
  cmdLockAll: [0xD0, 0x15],
  // 打开一个锁（请求借车）
  cmdOpenSingleLock: [0xD0, 0x16],
  // 预约借车
  cmdReserveCart: [0xD0, 0x17],
  // 取消预约借车
  cmdCancelReserveCart: [0xD0, 0x18],
  // 预约还车
  cmdReserveBack: [0xD0, 0x19],
  // 取消预约还车
  cmdCancelReserveBack: [0xD0, 0x1A],
  // 手动还车
  cmdHandleLockBack: [0xd0, 0x1c],
  // GPS位置
  GPSLocation: [0x90, 0x18]
}
const PARSE_LIST = {
  // 查询主锁Id
  queryModuleId: [0x10, 0x01],
  //查询主锁运行模式（正常模式与运维模式）
  queryModuleRunMode: [0x10, 0x14],
  // 连接验证
  connectValidate: [0x50, 0x1D],
  //查询锁状态信息
  queryLockState: [0x10, 0x15],
  // 查询所有锁锁死状态，正常或者锁死
  queryAllLockState: [0x10, 0x16],
  //查询电池状态，包括是否充电与电量百分比
  queryBatteryState: [0x10, 0x17],
  //锁死或者打开所有锁，带数据[0x00]锁死所有锁，带数据[0x01]打开所有锁
  cmdLockAll: [0x50, 0x15],
  // 打开一个锁（请求借车）
  cmdOpenSingleLock: [0x50, 0x16],
  // 预约借车
  cmdReserveCart: [0x50, 0x17],
  // 取消预约借车
  cmdCancelReserveCart: [0x50, 0x18],
  // 预约还车
  cmdReserveBack: [0x50, 0x19],
  // 取消预约还车
  cmdCancelReserveBack: [0x50, 0x1A],
  // 手动还车
  cmdHandleLockBack: [0x50, 0x1c],
  // GPS位置
  GPSLocation: [0x10, 0x18]
}
module.exports = {
  UUID,
  errCode,
  lockState,
  password,
  CMD_LIST,
  PARSE_LIST
};