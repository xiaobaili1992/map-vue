<template>
  <div class="map-container">
    <div class="operate-manual">
      <div class="manual-row" :class="{ open: manualOpen }">
        <span class="manual-title" v-if="!manualOpen">操作说明</span>
        <div class="manual-detail">
          <div class="detail-item">
            <img :src="MouseIcon" />
            <span>: 拖动地图</span>
          </div>
          <div class="detail-item">
            <img :src="MouseWheelIcon" />
            <span>: 放大缩小地图</span>
          </div>
        </div>
        <img :src="manualOpen ? ShrinkIcon : ExpandIcon" @click="manualOpen = !manualOpen" />
      </div>
    </div>
    <div :id="mapId" class="map-content" />
    <div class="current-position">
      <img :src="CurrentPositionIcon" alt="定位中心点" @click="centerMapOnStation" />
    </div>
    <div v-if="renderLoading" class="render-loading">
      <el-icon class="spinner" size="24"><Loading /></el-icon>
      <span>正射影像渲染中，请稍后...</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, createApp, watch } from 'vue';
import { Scene, LineLayer, PointLayer, ImageLayer, Marker } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';
import gcoord from 'gcoord';
import { ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import PopupContent from './PopupContent.vue';

// Assets
import pointIcon from '../assets/image/point-icon.png';
import startIcon from '../assets/image/start-icon.png';
import CurrentPositionIcon from '../assets/image/current-position-icon.png';
import ExpandIcon from '../assets/image/expand-icon.png';
import ShrinkIcon from '../assets/image/shrink-icon.png';
import MouseIcon from '../assets/image/mouse-icon.png';
import MouseWheelIcon from '../assets/image/mouse-wheel-icon.png';

const props = defineProps({
  center: { type: Array, default: () => [119.436345, 44.458526] },
  zoom: { type: Number, default: 15 },
  mapToken: { type: String, default: '012996f37c22ab7267725dc3a2840f88' },
  mapStyle: { type: String, default: 'amap://styles/dark' },
  orthoPhotoUrl: { type: String, default: 'https://oss.dee3060.com/minio/default/20251222171936203457-950de464-653c-4531-984f-d5125a3dd7c5-JDWX_TEST.tif' },
  showOrthoPhoto: { type: Boolean, default: false },
  regions: { type: Array, default: () => [] },
  flightRoute: { type: Array, default: () => [] },
});

const mapId = `previewMap-${Math.random().toString(36).substr(2, 9)}`;

let scene = null;
let orthophotoLayer = null;
let areaLayer = null;
let flyRouteLayer = null;
let flyRoutePointLayer = null;
let flyRouteTextLayer = null;
let textLayer = null;
let popupMarker = null;
let popupApp = null;
let popupContainer = null;

const manualOpen = ref(false);
const mapReady = ref(false);
const centerGcj = ref([0, 0]);
const minLat = ref(0);
const minLon = ref(0);
const maxLat = ref(0);
const maxLon = ref(0);
const uploadedImageUrl = ref(null);
const imageUrl = ref(null);
const renderLoading = ref(false);

watch(
  () => props.center,
  (val) => {
    if (val && val.length === 2) {
      const transformed = gcoord.transform(val, gcoord.WGS84, gcoord.GCJ02);
      centerGcj.value = transformed;
      if (scene) scene.setCenter(transformed);
    }
  },
  { immediate: true },
);

watch(
  () => props.orthoPhotoUrl,
  async (val) => {
    if (val && props.showOrthoPhoto && mapReady.value) {
      renderLoading.value = true;
      await loadTiffUrl(val);
      renderLoading.value = false;
    }
  },
);

watch(
  () => props.regions,
  (val) => {
    if (mapReady.value) {
      drawRegions(val);
    }
  },
  { deep: true },
);

watch(
  () => props.flightRoute,
  (val) => {
    if (mapReady.value) {
      drawFlyRoute(val);
    }
  },
  { deep: true },
);

onMounted(() => {
  initMap();
});

const initMap = () => {
  const mapInstance = new GaodeMap({
    center: centerGcj.value,
    zoom: props.zoom,
    maxZoom: 19,
    style: props.mapStyle,
    showIndoorMap: false,
    features: ['bg', 'road', 'building'],
    autoFit: true,
    type: 'amap',
    token: props.mapToken,
    rotateEnable: true,
    dragEnable: true,
    doubleClickZoom: false,
    offsetCoordinate: true,
  });
  scene = new Scene({
    id: mapId,
    stencil: true,
    depth: { enable: false },
    antialias: true,
    preserveDrawingBuffer: false,
    map: mapInstance,
    logoVisible: false,
  });

  const container = document.getElementById(mapId);
  if (container) {
    container.addEventListener('dblclick', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });
  }

  scene.setBgColor('rgb(42, 42, 42)');

  scene.addImage('icon', pointIcon);
  scene.addImage('start', startIcon);

  scene.on('loaded', async () => {
    try {
      const amap = scene && scene.map;
      if (amap && window.AMap) {
        amap.setLayers([
          new window.AMap.TileLayer.Satellite(),
          new window.AMap.TileLayer.RoadNet(),
        ]);
      }
    } catch (e) {
      console.log('error', e);
    }
    mapReady.value = true;

    // Initial Render
    if (props.flightRoute.length) drawFlyRoute(props.flightRoute);
    if (props.regions.length) drawRegions(props.regions);
    if (props.orthoPhotoUrl && props.showOrthoPhoto) {
      renderLoading.value = true;
      await loadTiffUrl(props.orthoPhotoUrl);
      renderLoading.value = false;
    }
  });
};

const loadTiffUrl = async (url) => {
  try {
    await uploadGeoTiffFromUrl(url);
    addOrthophoto();
  } catch (e) {
    console.error(e);
  }
};

const convertBoundsToGcj02 = (minLon, minLat, maxLon, maxLat) => {
  try {
    const points = [
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
    ];

    const result = points.map((point) => {
      return gcoord.transform(point, gcoord.WGS84, gcoord.GCJ02);
    });

    const lons = result.map((p) => p[0]);
    const lats = result.map((p) => p[1]);

    return [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ];
  } catch (e) {
    console.error('gcoord conversion failed:', e);
    return [
      [minLon, minLat],
      [maxLon, maxLat],
    ];
  }
};

const uploadGeoTiffFromUrl = async (url) => {
  try {
    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const bbox = image.getBoundingBox();
    const geoKeys = image.getGeoKeys?.() || image.geoKeys || {};
    const epsg = geoKeys.ProjectedCSTypeGeoKey ?? geoKeys.GeographicTypeGeoKey;
    if (epsg == null) {
      console.error('影像坐标系缺失，无法解析经纬度范围。');
      return;
    }

    let fromCRS = '';
    if (epsg === 4326) {
      fromCRS = 'EPSG:4326';
    } else if (epsg === 32650) {
      proj4.defs('EPSG:32650', '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs');
      fromCRS = 'EPSG:32650';
    } else if (epsg === 32651) {
      proj4.defs('EPSG:32651', '+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs');
      fromCRS = 'EPSG:32651';
    } else {
      console.error(`Unsupported EPSG code: ${epsg}. Only EPSG:32650/32651/4326 is supported.`);
      return;
    }

    const project = (x, y) =>
      fromCRS === 'EPSG:4326' ? [x, y] : proj4(fromCRS, 'EPSG:4326', [x, y]);
    const [minLonTransformed, minLatTransformed] = project(bbox[0], bbox[1]);
    const [maxLonTransformed, maxLatTransformed] = project(bbox[2], bbox[3]);

    const [[minLonGcj, minLatGcj], [maxLonGcj, maxLatGcj]] = convertBoundsToGcj02(
      minLonTransformed,
      minLatTransformed,
      maxLonTransformed,
      maxLatTransformed,
    );

    minLon.value = minLonGcj;
    minLat.value = minLatGcj;
    maxLon.value = maxLonGcj;
    maxLat.value = maxLatGcj;

    const width = image.getWidth();
    const height = image.getHeight();
    const maxPixels = 2_000_000;
    let outW = width;
    let outH = height;
    if (width * height > maxPixels) {
      const scale = Math.sqrt(maxPixels / (width * height));
      outW = Math.max(1, Math.floor(width * scale));
      outH = Math.max(1, Math.floor(height * scale));
    }

    const rasters = await image.readRasters({ width: outW, height: outH, interleave: false });

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(outW, outH);
    const bands = Array.isArray(rasters) ? rasters.length : 1;
    const bits = image.getBitsPerSample();
    const toScale = (n) => (n && n > 8 ? 255 / ((1 << n) - 1) : 1);
    const scaleR = toScale(bits?.[0]);
    const scaleG = toScale(bits?.[1] ?? bits?.[0]);
    const scaleB = toScale(bits?.[2] ?? bits?.[0]);
    const scaleA = toScale(bits?.[3] ?? 8);

    const r = bands >= 1 ? rasters[0] : null;
    const g = bands >= 2 ? rasters[1] : r;
    const b = bands >= 3 ? rasters[2] : r;
    const a = bands >= 4 ? rasters[3] : null;

    const fd = image.getFileDirectory?.() || image.fileDirectory;
    let noDataVal = null;
    try {
      if (typeof image.getGDALNoData === 'function') {
        const nd = image.getGDALNoData();
        noDataVal = Array.isArray(nd) ? Number(nd[0]) : Number(nd);
        if (!Number.isFinite(noDataVal)) noDataVal = null;
      }
      if (noDataVal == null && fd && fd.GDAL_NODATA != null) {
        const v = Number(fd.GDAL_NODATA);
        noDataVal = Number.isFinite(v) ? v : null;
      }
    } catch (e) {
      console.log('e', e);
    }

    for (let p = 0, k = 0; p < outW * outH; p++, k += 4) {
      const rawR = r ? r[p] : 0;
      const rawG = g ? g[p] : rawR;
      const rawB = b ? b[p] : rawR;
      const R = Math.round(rawR * scaleR);
      const G = Math.round(rawG * scaleG);
      const B = Math.round(rawB * scaleB);

      let A = 255;
      if (a) {
        A = Math.round(a[p] * scaleA);
      } else {
        const isNoData =
          noDataVal != null
            ? (r && r[p] === noDataVal) || (g && g[p] === noDataVal) || (b && b[p] === noDataVal)
            : rawR === 0 && rawG === 0 && rawB === 0;
        if (isNoData) A = 0;
      }

      imageData.data[k] = R;
      imageData.data[k + 1] = G;
      imageData.data[k + 2] = B;
      imageData.data[k + 3] = A;
    }
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      console.error('影像编码失败，请重试。');
      return;
    }
    const outUrl = URL.createObjectURL(blob);
    uploadedImageUrl.value = outUrl;
    imageUrl.value = outUrl;
  } catch (err) {
    console.error(err);
    console.error('GeoTIFF 解析失败或文件过大。');
  }
};

const addOrthophoto = () => {
  const url = uploadedImageUrl.value || imageUrl.value;
  if (!url) {
    return;
  }

  const extent = [minLon.value, minLat.value, maxLon.value, maxLat.value];
  if (orthophotoLayer) {
    scene.removeLayer(orthophotoLayer);
    orthophotoLayer = null;
  }
  orthophotoLayer = new ImageLayer({ zIndex: 50 })
    .source(url, { parser: { type: 'image', extent } })
    .style({ opacity: 1 });
  scene.addLayer(orthophotoLayer);

  scene.fitBounds(
    [
      [minLon.value, minLat.value],
      [maxLon.value, maxLat.value],
    ],
    { padding: [20, 20] },
  );
  if (orthophotoLayer) {
    try {
      orthophotoLayer.show();
      scene.render();
    } catch (e) {
      console.log('e', e);
    }
  }
};

const drawRegions = (regions) => {
  if (areaLayer) {
    scene.removeLayer(areaLayer);
    areaLayer = null;
  }
  const rings = [];
  regions?.forEach((item) => {
    if (!Array.isArray(item)) return;

    // const transformed = item.map((p) => gcoord.transform([p[0], p[1]], gcoord.WGS84, gcoord.GCJ02));
    const transformed = item.map((p) => [p[0], p[1]]);

    const first = transformed[0];
    const last = transformed[transformed.length - 1];
    const closed = last && first && last[0] === first[0] && last[1] === first[1];
    const outRing = closed ? transformed : [...transformed, first];
    if (outRing.length < 4) return;
    rings.push(outRing);
  });

  if (rings.length === 0) return;

  const fc = {
    type: 'FeatureCollection',
    features: rings.map((ring) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: ring },
    })),
  };

  areaLayer = new LineLayer({ zIndex: 150 }).source(fc).size(2).color('#2389FF').style({
    opacity: 1,
    lineType: 'solid',
  });
  scene.addLayer(areaLayer);

  if (rings.length) {
    const xs = rings.flat().map((p) => p[0]);
    const ys = rings.flat().map((p) => p[1]);
    const bounds = [
      [Math.min(...xs), Math.min(...ys)],
      [Math.max(...xs), Math.max(...ys)],
    ];
    scene.fitBounds(bounds, { padding: 30 });
  }
  scene.render();
};

const drawFlyRoute = (routeData) => {
  if (!routeData || routeData.length === 0) {
    return;
  }

  // Transform WGS84 to GCJ02
  const transformedRoute = routeData.map((item) => {
    const [lng, lat] = gcoord.transform([item.longitude, item.latitude], gcoord.WGS84, gcoord.GCJ02);
    return {
      ...item,
      lng,
      lat,
    };
  });

  addFlyRouteLayer(transformedRoute);
  addFlyRoutePointLayer(transformedRoute);
  addFlyRouteTextLayer(transformedRoute);

  const bounds = transformedRoute.reduce(
    (acc, p) => {
      acc[0][0] = Math.min(acc[0][0], p.lng);
      acc[0][1] = Math.min(acc[0][1], p.lat);
      acc[1][0] = Math.max(acc[1][0], p.lng);
      acc[1][1] = Math.max(acc[1][1], p.lat);
      return acc;
    },
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ],
  );
  scene.fitBounds(bounds, { padding: 50 });
  scene.routeData = transformedRoute;
};

const addFlyRouteLayer = (routeData) => {
  if (flyRouteLayer) scene.removeLayer(flyRouteLayer);
  const startColor = [14, 133, 245, 1];
  const endColor = [4, 222, 241, 1];
  const segmentFeatures = [];
  for (let i = 0; i < routeData.length - 1; i++) {
    const t = routeData.length - 2 > 0 ? i / (routeData.length - 2) : 0;
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);
    const a = startColor[3] + (endColor[3] - startColor[3]) * t;
    const color = `rgba(${r},${g},${b},${a})`;
    segmentFeatures.push({
      type: 'Feature',
      properties: { segmentColor: color },
      geometry: {
        type: 'LineString',
        coordinates: [
          [routeData[i].lng, routeData[i].lat],
          [routeData[i + 1].lng, routeData[i + 1].lat],
        ],
      },
    });
  }
  flyRouteLayer = new LineLayer({
    name: 'route-line',
    zIndex: 200,
    depth: false,
    blend: 'normal',
  })
    .source({
      type: 'FeatureCollection',
      features: segmentFeatures,
    })
    .size(2)
    .color('segmentColor', (d) => d)
    .style({
      lineType: 'solid',
    });
  scene.addLayer(flyRouteLayer);
};

const addFlyRoutePointLayer = (routeData) => {
  if (flyRoutePointLayer) scene.removeLayer(flyRoutePointLayer);
  const pointData = routeData.map((item, index) => ({
    ...item,
    icon: index === 0 ? 'start' : 'icon',
  }));
  flyRoutePointLayer = new PointLayer({
    name: 'waypoints',
    zIndex: 201,
    depth: false,
  })
    .source(pointData, {
      parser: {
        type: 'json',
        x: 'lng',
        y: 'lat',
      },
    })
    .shape('icon', (val) => val)
    .size(20)
    .style({
      stroke: '#fff',
      strokeWidth: 2,
    });
  flyRoutePointLayer.on('mouseenter', (e) => {
    const { lng, lat } = e.lnglat || { lng: e.feature?.lng, lat: e.feature?.lat };
    const index = e.featureId + 1;
    const { image_rgb_url, image_thermal_url } = e.feature || {};
    if (image_rgb_url || image_thermal_url) {
      openPopup({ url1: image_rgb_url, url2: image_thermal_url, lng, lat, index });
    }
  });
  scene.addLayer(flyRoutePointLayer);
};

const addFlyRouteTextLayer = (routeData) => {
  if (flyRouteTextLayer) scene.removeLayer(flyRouteTextLayer);
  const textData = routeData.map((item, index) => ({
    ...item,
    name: index === 0 ? '' : index + 1,
  }));
  textLayer = new PointLayer({ zIndex: 202 })
    .source(textData, {
      parser: {
        type: 'json',
        x: 'lng',
        y: 'lat',
      },
    })
    .shape('name', 'text')
    .size(14)
    .color('#fff')
    .style({
      textAnchor: 'center',
      spacing: 2,
      stroke: '#fff',
      strokeWidth: 0.2,
      fontFamily: 'D-DIN-PRO',
      textOffset: [2, -2],
    });
  scene.addLayer(textLayer);
};

const openPopup = ({ url1, url2, lng, lat, index }) => {
  if (!scene || lng == null || lat == null) return;
  closePopup();
  popupContainer = document.createElement('div');
  popupApp = createApp(PopupContent, { url1, url2, index, onClose: closePopup });

  popupApp.mount(popupContainer);
  popupMarker = new Marker({ offsets: [0, 36] }).setLnglat([lng, lat]).setElement(popupContainer);
  scene.addMarker(popupMarker);
};

const closePopup = () => {
  if (popupMarker) {
    popupMarker.remove();
    popupMarker = null;
  }
  if (popupApp) {
    popupApp.unmount();
    popupApp = null;
  }
  popupContainer = null;
};

const centerMapOnStation = () => {
  if (scene) scene.setCenter(centerGcj.value);
};

onBeforeUnmount(() => {
  if (orthophotoLayer && scene) {
    scene.removeLayer(orthophotoLayer);
    orthophotoLayer = null;
  }
  if (flyRouteLayer && scene) {
    scene.removeLayer(flyRouteLayer);
    flyRouteLayer = null;
  }
  if (flyRoutePointLayer && scene) {
    scene.removeLayer(flyRoutePointLayer);
    flyRoutePointLayer = null;
  }
  if (flyRouteTextLayer && scene) {
    scene.removeLayer(flyRouteTextLayer);
    flyRouteTextLayer = null;
  }
  if (textLayer && scene) {
    scene.removeLayer(textLayer);
    textLayer = null;
  }
  if (areaLayer && scene) {
    scene.removeLayer(areaLayer);
    areaLayer = null;
  }
  if (scene) {
    scene.destroy();
  }
});
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  .operate-manual {
    position: absolute;
    left: 32px;
    top: 32px;
    z-index: 10;
    .manual-row {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      padding: 6px 12px;
      background: rgba(51, 51, 51, 0.5);
      border-radius: 4px;
      backdrop-filter: blur(10px);
      font-size: 14px;
      color: #dbdbdb;
      .manual-title {
        font-size: 12px;
      }
      .manual-detail {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
        gap: 16px;
        max-width: 0;
        opacity: 0;
        transition:
          max-width 220ms ease,
          opacity 180ms ease;
        .detail-item {
          display: flex;
          align-items: center;
          gap: 2px;
          img {
            width: 13px;
            height: 13px;
          }
        }
      }
      img {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
    }
    .manual-row.open .manual-detail {
      max-width: 700px;
      opacity: 1;
    }
  }
  .map-content {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(42, 42, 42);
    border-radius: 8px;
  }
  .current-position {
    position: absolute;
    bottom: 32px;
    left: 32px;
    z-index: 1;
    img {
      width: 44px;
      height: 44px;
      cursor: pointer;
    }
  }
  .render-loading {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.6);
    z-index: 20;
    color: #2355d8;
    font-size: 14px;
    .spinner {
      animation: spin 1s linear infinite;
    }
  }
  ::v-deep(.amap-logo),
  ::v-deep(.amap-copyright) {
    display: none !important;
  }
  ::v-deep(.amap-container) {
    border-radius: 8px;
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
