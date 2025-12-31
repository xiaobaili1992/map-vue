<template>
  <div class="map-container">
    <div class="map-content" :id="mapId" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import {
  Scene,
  LineLayer,
  PointLayer,
  PolygonLayer,
} from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';

const props = defineProps({
  // 墙体边界数据 (e.g. wuxi.json)
  wallGeoJson: {
    type: Object,
    default: () => ({})
  },
  // 区域面数据 (e.g. wuxi_xian.json)
  areaGeoJson: {
    type: Object,
    default: () => ({})
  },
  // 纹理图片 URL
  textureMap: {
    type: String,
    default: ''
  },
  // 地图中心 [lng, lat]
  center: {
    type: Array,
    default: () => [120.041663, 31.454729]
  },
  // 缩放级别
  zoom: {
    type: Number,
    default: 9
  },
  // 飞线数据
  flyData: {
    type: Array,
    default: () => []
  }
});

const mapId = 'map-' + Math.random().toString(36).substr(2, 9);
let scene = null;
const mapLayers = {};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (scene) {
    scene.destroy();
  }
});

const initMap = () => {
  scene = new Scene({
    id: mapId,
    stencil: true,
    depth: { enable: false },
    antialias: true,
    preserveDrawingBuffer: false,
    map: new GaodeMap({
      center: props.center,
      zoom: props.zoom,
      minZoom: 5,
      maxZoom: 19,
      pitch: 34,
      style: 'amap://styles/dark',
      showIndoorMap: false,
      features: ['bg', 'road', 'building'],
      autoFit: true,
      token: '012996f37c22ab7267725dc3a2840f88',
      rotateEnable: true,
      dragEnable: true,
    }),
    logoVisible: false,
  });

  scene.setBgColor('rgb(42, 42, 42)');

  scene.on('loaded', () => {
    if (props.wallGeoJson && Object.keys(props.wallGeoJson).length) {
      addLineWall();
    }
    if (props.areaGeoJson && Object.keys(props.areaGeoJson).length) {
      addLineDown();
      addLineUp();
      addText();
      addPolygon();
    }
    if (props.flyData && props.flyData.length) {
      addFly();
    }
  });
};

const addLineWall = () => {
  mapLayers.lineWall = new LineLayer()
    .source(props.wallGeoJson)
    .shape('wall')
    .size(50000)
    .style({
      heightfixed: true,
      opacity: 1,
      sourceColor: 'RGBA(18, 216, 254, 0.1)',
      targetColor: 'RGBA(18, 216, 254, 0.9)',
    });
  scene.addLayer(mapLayers.lineWall);
};

const addLineDown = () => {
  mapLayers.lineDown = new LineLayer()
    .source(props.areaGeoJson)
    .shape('line')
    .color('RGBA(18, 216, 254, 0.3)')
    .size(1)
    .style({
      raisingHeight: 0,
      heightfixed: true,
      pickLight: false,
    });
  scene.addLayer(mapLayers.lineDown);
};

const addLineUp = () => {
  mapLayers.lineUp = new LineLayer({ zIndex: 12 })
    .source(props.areaGeoJson)
    .shape('line')
    .color('RGBA(18, 216, 254, 1)')
    .size(1)
    .style({
      raisingHeight: 50000,
      heightfixed: true,
      pickLight: false,
    });
  scene.addLayer(mapLayers.lineUp);
};

const addPolygon = () => {
  const layer = new PolygonLayer({
    zIndex: 10,
    workerEnabled: true,
  })
    .source(props.areaGeoJson)
    .size(10)
    .shape('extrude')
    .color('#0ff')
    .style({
      heightfixed: true,
      pickLight: false,
      raisingHeight: 24000,
      opacity: 0.9,
      mapTexture: props.textureMap,
      mapping: 'viewport',
      fontFamily: 'D-DIN-PRO',
    });
    
  scene.addLayer(layer);
  mapLayers.polygon = layer;
};

const addText = () => {
  const texts = props.areaGeoJson.features.map((option) => {
    const { name, center } = option.properties;
    if (!center) return null;
    const [lng, lat] = center;
    return { name, lng, lat };
  }).filter(Boolean);

  mapLayers.text = new PointLayer({ zIndex: 11 })
    .source(texts, {
      parser: {
        type: 'json',
        x: 'lng',
        y: 'lat',
      },
    })
    .shape('name', 'text')
    .size(12)
    .color('#0ff')
    .style({
      textAnchor: 'center',
      spacing: 2,
      padding: [1, 1],
      stroke: '#0ff',
      strokeWidth: 0.2,
      raisingHeight: 100000,
      heightfixed: true,
      pickLight: false,
      textAllowOverlap: true,
      fontFamily: 'D-DIN-PRO',
      textOffset: [0, -80],
    });
  scene.addLayer(mapLayers.text);
};

const addFly = () => {
  if (!props.flyData.length) return;
    
  mapLayers.fly = new LineLayer({
    blend: 'normal',
    zIndex: 14,
    pickingBuffer: 2,
    enablePropagation: false,
    enablePicking: false,
  })
    .source(props.flyData, {
      parser: {
        type: 'json',
        x: 'lng',
        y: 'lat',
        x1: 'lng1',
        y1: 'lat1',
      },
    })
    .size(4)
    .shape('arc3d')
    .animate({
      interval: 0.8,
      trailLength: 1,
      duration: 3,
    })
    .style({
      targetColor: 'RGBA(239, 238, 196, 1)',
      sourceColor: 'RGBA(213, 168, 90, 1)',
      opacity: 0.9,
      raisingHeight: 100000,
      heightfixed: true,
      thetaOffset: 2,
    });

  scene.addLayer(mapLayers.fly);
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
}
.map-content {
  width: 100%;
  height: 100%;
}
</style>