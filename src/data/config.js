import PhotovoltaicIcon from '@/assets/image/photovoltaic-icon.png';
import ChargeStationIcon from '@/assets/image/charge-station-icon.png';
import EnergyStorageIcon from '@/assets/image/energy-storage-icon.png';
import AggregateUsersIcon from '@/assets/image/not-signed-icon.png';
// import WindPowerIcon from '@/assets/image/wind-power-icon.png';
import LightIcon from '@/assets/image/light-pole-icon.png';
import ParkIcon from '@/assets/image/park-icon.png';

const flyData = [
  { lng: 120.296429, lat: 31.472996, lng1: 120.29166, lat1: 31.848762 }, // 江阴
  { lng: 120.296429, lat: 31.472996, lng1: 120.488195, lat1: 31.636849 }, // 锡山
  { lng: 120.296429, lat: 31.472996, lng1: 120.200926, lat1: 31.646179 }, // 惠山
  { lng: 120.296429, lat: 31.472996, lng1: 120.295311, lat1: 31.592549 }, // 梁溪
  { lng: 120.296429, lat: 31.472996, lng1: 120.430221, lat1: 31.524219 }, // 新吴
  { lng: 120.296429, lat: 31.472996, lng1: 119.753208, lat1: 31.364816 }, // 宜兴
];

const pointData = [
  // { lng: 120.296429, lat: 31.472996 },
  { lng: 120.29166, lat: 31.848762 },
  { lng: 120.488195, lat: 31.636849 },
  { lng: 120.200926, lat: 31.646179 },
  { lng: 120.295311, lat: 31.592549 },
  { lng: 120.430221, lat: 31.524219 },
  { lng: 119.753208, lat: 31.364816 },
];

const hangZhouFlyData = [
  { lng: 120.159356, lat: 30.332758, lng1: 120.245664, lat1: 30.449348 }, // 临平
  { lng: 120.159356, lat: 30.332758, lng1: 120.499434, lat1: 30.326003 }, // 钱塘
  { lng: 120.159356, lat: 30.332758, lng1: 120.227532, lat1: 30.300676 }, // 上城
  { lng: 120.159356, lat: 30.332758, lng1: 119.896345, lat1: 30.392827 }, // 余杭
  { lng: 120.159356, lat: 30.332758, lng1: 120.327434, lat1: 30.188274 }, // 萧山
  { lng: 120.159356, lat: 30.332758, lng1: 120.194128, lat1: 30.182812 }, // 滨江
  { lng: 120.159356, lat: 30.332758, lng1: 120.072718, lat1: 30.179142 }, // 西湖
  { lng: 120.159356, lat: 30.332758, lng1: 119.397614, lat1: 30.232595 }, // 临安
  { lng: 120.159356, lat: 30.332758, lng1: 119.875076, lat1: 30.016108 }, // 富阳
  { lng: 120.159356, lat: 30.332758, lng1: 119.524213, lat1: 29.846008 }, // 桐庐
  { lng: 120.159356, lat: 30.332758, lng1: 118.914299, lat1: 29.686659 }, // 淳安
  { lng: 120.159356, lat: 30.332758, lng1: 119.428137, lat1: 29.505446 }, // 建德
];

const hangZhouPointData = [
  { lng: 120.159356, lat: 30.332758 },
  { lng: 120.245664, lat: 30.449348 },
  { lng: 120.499434, lat: 30.326003 },
  { lng: 120.227532, lat: 30.300676 },
  { lng: 119.896345, lat: 30.392827 },
  { lng: 120.327434, lat: 30.188274 },
  { lng: 120.194128, lat: 30.182812 },
  { lng: 120.072718, lat: 30.179142 },
  { lng: 119.397614, lat: 30.232595 },
  { lng: 119.875076, lat: 30.016108 },
  { lng: 119.524213, lat: 29.846008 },
  { lng: 118.914299, lat: 29.686659 },
  { lng: 119.428137, lat: 29.505446 },
];

const typeMap = {
  ST_CHARGER: 'chargeStation',
  ST_PV: 'photovoltaic',
  ST_ES: 'energyStorage',
  ST_USER: 'aggregateUsers',
  DEV_LIGHT_POLE: 'light',
  ST_PARK: 'park',
};

const pointTypes = {
  photovoltaic: {
    name: '光伏',
    icon: PhotovoltaicIcon,
    color: '#FFA500',
  },
  energyStorage: {
    name: '储能',
    icon: EnergyStorageIcon,
    color: '#00BFFF',
  },
  chargeStation: {
    name: '充电桩',
    icon: ChargeStationIcon,
    color: '#32CD32',
  },
  light: {
    name: '照明',
    icon: LightIcon,
    color: '#9370DB',
  },
  // windPower: {
  //   name: '风电',
  //   icon: WindPowerIcon,
  //   color: '#9370DB',
  // },
  aggregateUsers: {
    name: '聚合用户',
    icon: AggregateUsersIcon,
    color: '#FF6347',
  },
  park: {
    name: '示范园区',
    icon: ParkIcon,
    color: '#BA55D3',
  },
};

const legendSourceData = Object.entries(pointTypes).map(([id, config]) => ({
  id,
  icon: config.icon,
  label: config.name,
  value: true,
}));

const areaTopOneData = [
  {
    label: '占地面积(km²)',
    value: 0,
  },
  {
    label: '累计响应(次)',
    value: 0,
  },
];

const areaTopTwoData = [
  {
    label: '总面积(km²)',
    value: 0,
  },
  {
    label: '陆地面积(km²)',
    value: 0,
  },
  {
    label: '水域面积(km²)',
    value: 0,
  },
  {
    label: '累计响应(次)',
    value: 0,
  },
];

const areaMiddleData = [
  {
    key: 'pv',
    label1: '光伏聚合量(kWp)',
    value1: 0,
    label2: '占全区(%)',
    value2: 0,
    label3: '可签约(kWp)',
    value3: 0,
  },
  {
    key: 'ems',
    label1: '储能聚合量(kWh)',
    value1: 0,
    label2: '占全区(%)',
    value2: 0,
    label3: '可签约(kWh)',
    value3: 0,
  },
  {
    key: 'charger',
    label1: '充电桩聚合量(kW)',
    value1: 0,
    label2: '占全区(%)',
    value2: 0,
    label3: '可签约(kW)',
    value3: 0,
  },
  {
    key: 'light',
    label1: '照明聚合量(kW)',
    value1: 0,
    label2: '占全区(%)',
    value2: 0,
    label3: '可签约(kW)',
    value3: 0,
  },
];

const flyRouteData = [
  {
    "id": 97,
    "waypoint_index": 1,
    "longitude": 120.1517653,
    "latitude": 30.3413722,
    "altitude": 130,
    "waypoint_str": "120.151765,30.341372,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665742_DJI_20251220155031_0001_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665767_DJI_20251220155031_0001_T.JPG",
    "record_id": 3
  },
  {
    "id": 98,
    "waypoint_index": 2,
    "longitude": 120.1517654,
    "latitude": 30.3401779,
    "altitude": 130,
    "waypoint_str": "120.151765,30.340178,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665742_DJI_20251220155033_0002_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665767_DJI_20251220155033_0002_T.JPG",
    "record_id": 3
  },
  {
    "id": 99,
    "waypoint_index": 3,
    "longitude": 120.151969,
    "latitude": 30.3395049,
    "altitude": 130,
    "waypoint_str": "120.151969,30.339505,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665742_DJI_20251220155035_0003_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665767_DJI_20251220155035_0003_T.JPG",
    "record_id": 3
  },
  {
    "id": 100,
    "waypoint_index": 4,
    "longitude": 120.1519689,
    "latitude": 30.3413793,
    "altitude": 130,
    "waypoint_str": "120.151969,30.341379,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665742_DJI_20251220155037_0004_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665767_DJI_20251220155037_0004_T.JPG",
    "record_id": 3
  },
  {
    "id": 101,
    "waypoint_index": 5,
    "longitude": 120.1521724,
    "latitude": 30.3413865,
    "altitude": 130,
    "waypoint_str": "120.152172,30.341386,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665743_DJI_20251220155039_0005_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665767_DJI_20251220155039_0005_T.JPG",
    "record_id": 3
  },
  {
    "id": 102,
    "waypoint_index": 6,
    "longitude": 120.1521726,
    "latitude": 30.3394844,
    "altitude": 130,
    "waypoint_str": "120.152173,30.339484,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665743_DJI_20251220155040_0006_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665767_DJI_20251220155041_0006_T.JPG",
    "record_id": 3
  },
  {
    "id": 103,
    "waypoint_index": 7,
    "longitude": 120.1523761,
    "latitude": 30.339464,
    "altitude": 130,
    "waypoint_str": "120.152376,30.339464,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665743_DJI_20251220155042_0007_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155042_0007_T.JPG",
    "record_id": 3
  },
  {
    "id": 104,
    "waypoint_index": 8,
    "longitude": 120.152376,
    "latitude": 30.3413937,
    "altitude": 130,
    "waypoint_str": "120.152376,30.341394,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665744_DJI_20251220155044_0008_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155044_0008_T.JPG",
    "record_id": 3
  },
  {
    "id": 105,
    "waypoint_index": 9,
    "longitude": 120.1525795,
    "latitude": 30.3414008,
    "altitude": 130,
    "waypoint_str": "120.152580,30.341401,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665744_DJI_20251220155046_0009_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155046_0009_T.JPG",
    "record_id": 3
  },
  {
    "id": 106,
    "waypoint_index": 10,
    "longitude": 120.1525797,
    "latitude": 30.3394435,
    "altitude": 130,
    "waypoint_str": "120.152580,30.339444,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665744_DJI_20251220155048_0010_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155048_0010_T.JPG",
    "record_id": 3
  },
  {
    "id": 107,
    "waypoint_index": 11,
    "longitude": 120.1527832,
    "latitude": 30.339423,
    "altitude": 130,
    "waypoint_str": "120.152783,30.339423,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665744_DJI_20251220155050_0011_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155050_0011_T.JPG",
    "record_id": 3
  },
  {
    "id": 108,
    "waypoint_index": 12,
    "longitude": 120.1527831,
    "latitude": 30.341408,
    "altitude": 130,
    "waypoint_str": "120.152783,30.341408,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665744_DJI_20251220155058_0015_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155052_0012_T.JPG",
    "record_id": 3
  },
  {
    "id": 109,
    "waypoint_index": 13,
    "longitude": 120.1529866,
    "latitude": 30.3414152,
    "altitude": 130,
    "waypoint_str": "120.152987,30.341415,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665745_DJI_20251220155054_0013_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155054_0013_T.JPG",
    "record_id": 3
  },
  {
    "id": 110,
    "waypoint_index": 14,
    "longitude": 120.1529868,
    "latitude": 30.3394026,
    "altitude": 130,
    "waypoint_str": "120.152987,30.339403,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665745_DJI_20251220155056_0014_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155056_0014_T.JPG",
    "record_id": 3
  },
  {
    "id": 111,
    "waypoint_index": 15,
    "longitude": 120.1531904,
    "latitude": 30.3393821,
    "altitude": 130,
    "waypoint_str": "120.153190,30.339382,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665745_DJI_20251220155105_0019_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155058_0015_T.JPG",
    "record_id": 3
  },
  {
    "id": 112,
    "waypoint_index": 16,
    "longitude": 120.1531902,
    "latitude": 30.3414223,
    "altitude": 130,
    "waypoint_str": "120.153190,30.341422,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665746_DJI_20251220155101_0017_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155059_0016_T.JPG",
    "record_id": 3
  },
  {
    "id": 113,
    "waypoint_index": 17,
    "longitude": 120.1533937,
    "latitude": 30.3413838,
    "altitude": 130,
    "waypoint_str": "120.153394,30.341384,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665746_DJI_20251220155103_0018_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155101_0017_T.JPG",
    "record_id": 3
  },
  {
    "id": 114,
    "waypoint_index": 18,
    "longitude": 120.1533939,
    "latitude": 30.3393617,
    "altitude": 130,
    "waypoint_str": "120.153394,30.339362,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665746_DJI_20251220155113_0023_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155103_0018_T.JPG",
    "record_id": 3
  },
  {
    "id": 115,
    "waypoint_index": 19,
    "longitude": 120.1535975,
    "latitude": 30.3393412,
    "altitude": 130,
    "waypoint_str": "120.153597,30.339341,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665747_DJI_20251220155052_0012_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155105_0019_T.JPG",
    "record_id": 3
  },
  {
    "id": 116,
    "waypoint_index": 20,
    "longitude": 120.1535973,
    "latitude": 30.3413361,
    "altitude": 130,
    "waypoint_str": "120.153597,30.341336,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665747_DJI_20251220155059_0016_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155107_0020_T.JPG",
    "record_id": 3
  },
  {
    "id": 117,
    "waypoint_index": 21,
    "longitude": 120.1538009,
    "latitude": 30.3412884,
    "altitude": 130,
    "waypoint_str": "120.153801,30.341288,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665747_DJI_20251220155111_0022_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155109_0021_T.JPG",
    "record_id": 3
  },
  {
    "id": 118,
    "waypoint_index": 22,
    "longitude": 120.153801,
    "latitude": 30.3393207,
    "altitude": 130,
    "waypoint_str": "120.153801,30.339321,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665747_DJI_20251220155120_0027_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665768_DJI_20251220155111_0022_T.JPG",
    "record_id": 3
  },
  {
    "id": 119,
    "waypoint_index": 23,
    "longitude": 120.1540046,
    "latitude": 30.3395179,
    "altitude": 130,
    "waypoint_str": "120.154005,30.339518,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665748_DJI_20251220155107_0020_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155113_0023_T.JPG",
    "record_id": 3
  },
  {
    "id": 120,
    "waypoint_index": 24,
    "longitude": 120.1540044,
    "latitude": 30.3412407,
    "altitude": 130,
    "waypoint_str": "120.154004,30.341241,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665748_DJI_20251220155118_0026_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155115_0024_T.JPG",
    "record_id": 3
  },
  {
    "id": 121,
    "waypoint_index": 25,
    "longitude": 120.154208,
    "latitude": 30.341193,
    "altitude": 130,
    "waypoint_str": "120.154208,30.341193,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665748_DJI_20251220155128_0031_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155117_0025_T.JPG",
    "record_id": 3
  },
  {
    "id": 122,
    "waypoint_index": 26,
    "longitude": 120.1542081,
    "latitude": 30.3398264,
    "altitude": 130,
    "waypoint_str": "120.154208,30.339826,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665749_DJI_20251220155109_0021_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155118_0026_T.JPG",
    "record_id": 3
  },
  {
    "id": 123,
    "waypoint_index": 27,
    "longitude": 120.1544116,
    "latitude": 30.340135,
    "altitude": 130,
    "waypoint_str": "120.154412,30.340135,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665749_DJI_20251220155115_0024_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155120_0027_T.JPG",
    "record_id": 3
  },
  {
    "id": 124,
    "waypoint_index": 28,
    "longitude": 120.1544116,
    "latitude": 30.3411454,
    "altitude": 130,
    "waypoint_str": "120.154412,30.341145,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665749_DJI_20251220155126_0030_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155122_0028_T.JPG",
    "record_id": 3
  },
  {
    "id": 125,
    "waypoint_index": 29,
    "longitude": 120.1546151,
    "latitude": 30.3410977,
    "altitude": 130,
    "waypoint_str": "120.154615,30.341098,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665750_DJI_20251220155116_0025_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155124_0029_T.JPG",
    "record_id": 3
  },
  {
    "id": 126,
    "waypoint_index": 30,
    "longitude": 120.1546152,
    "latitude": 30.3404436,
    "altitude": 130,
    "waypoint_str": "120.154615,30.340444,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665750_DJI_20251220155124_0029_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155126_0030_T.JPG",
    "record_id": 3
  },
  {
    "id": 127,
    "waypoint_index": 31,
    "longitude": 120.1548187,
    "latitude": 30.3407521,
    "altitude": 130,
    "waypoint_str": "120.154819,30.340752,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665751_DJI_20251220155122_0028_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155128_0031_T.JPG",
    "record_id": 3
  },
  {
    "id": 128,
    "waypoint_index": 32,
    "longitude": 120.1548187,
    "latitude": 30.34105,
    "altitude": 130,
    "waypoint_str": "120.154819,30.341050,130.000000",
    "image_rgb_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/rgb-images/2025-12-25/1766665751_DJI_20251220155130_0032_V.JPG",
    "image_thermal_url": "https://uav-static.oss-cn-hangzhou.aliyuncs.com/thermal-images/2025-12-25/1766665769_DJI_20251220155130_0032_T.JPG",
    "record_id": 3
  }
];

const regionsData = [
  [
    [120.156475, 30.336849],
    [120.156119, 30.337878],
    [120.155804, 30.339232],
    [120.158229, 30.339474],
    [120.160114, 30.338818],
    [120.159517, 30.337647],
    [120.158825, 30.336666],
    [120.158072, 30.336719]
  ], [
    [120.155701, 30.336530],
    [120.158031, 30.336530],
    [120.160360, 30.336530],
    [120.160360, 30.338067],
    [120.160360, 30.339604],
    [120.158031, 30.339604],
    [120.155701, 30.339604],
    [120.155701, 30.338067]
  ],
];

export {
  flyData,
  pointData,
  hangZhouFlyData,
  hangZhouPointData,
  typeMap,
  pointTypes,
  legendSourceData,
  areaTopOneData,
  areaTopTwoData,
  areaMiddleData,
  flyRouteData,
  regionsData,
};
