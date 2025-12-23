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
          <div class="detail-item">
            <span>Ctrl +</span>
            <img :src="MouseIcon" />
            <span>: 拖动节点</span>
          </div>
          <div class="detail-item">
            <span>Ctrl +</span>
            <img :src="MouseIcon" />
            <span>: 拖动区域</span>
          </div>
          <div class="detail-item">
            <img :src="MouseIcon" />
            <span>双击节点</span>
            <span>: 新增节点</span>
          </div>
        </div>
        <img :src="manualOpen ? ShrinkIcon : ExpandIcon" @click="manualOpen = !manualOpen" />
      </div>
    </div>
    <div class="map-content" id="stationMap" />
    <div class="current-position">
      <img :src="CurrentPositionIcon" alt="定位电站中心点" @click="centerMapOnStation" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, defineExpose, defineEmits, defineProps } from 'vue';
import { ImageLayer, Marker, Scene, PolygonLayer } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';
import gcoord from 'gcoord';
import { ElMessage } from 'element-plus';
import PointIcon from './assets/image/point-icon.png';
import StartIcon from './assets/image/start-icon.png';
import ExpandIcon from './assets/image/expand-icon.png';
import ShrinkIcon from './assets/image/shrink-icon.png';
import MouseIcon from './assets/image/mouse-icon.png';
import MouseWheelIcon from './assets/image/mouse-wheel-icon.png';
import CurrentPositionIcon from './assets/image/current-position-icon.png';

let scene = null;
let orthophotoLayer = null;
let ctrlPressed = false;
let gaodeMap = null;
const polygonLayers = {};
let polygonLayerId = 0;
let currentPolygonLayerKey = null;
const polygonCoordsMap = {};
const polygonInitialCoordsMap = {};
const polygonHiddenMap = {};

const manualOpen = ref(false);
const minLat = ref(0);
const minLon = ref(0);
const maxLat = ref(0);
const maxLon = ref(0);
const uploadedImageUrl = ref(null);
const imageUrl = ref(null);
const polygonCoords = ref([]);
const savedCoords = ref([]);
const editing = ref(false);

const emits = defineEmits(['update:editing', 'polygon-updated', 'polygon-created']);
const props = defineProps({
  editing: { type: Boolean, default: false },
  center: { type: Array, default: () => [119.436345, 44.458526] },
  mapToken: { type: String, default: '012996f37c22ab7267725dc3a2840f88' },
  mapStyle: { type: String, default: 'amap://styles/dark' },
});

editing.value = props.editing;

onMounted(async () => {
  initMap();

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Control') ctrlPressed = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Control') ctrlPressed = false;
  });
});

const initMap = () => {
  const mapInstance = new GaodeMap({
    center: props.center,
    maxZoom: 19,
    style: props.mapStyle,
    showIndoorMap: false,
    features: ['bg', 'road', 'building'],
    autoFit: false,
    type: 'amap',
    token: props.mapToken,
    rotateEnable: false,
    pitchEnable: false,
    dragEnable: true,
    doubleClickZoom: false,
    offsetCoordinate: true,
  });
  gaodeMap = mapInstance;
  scene = new Scene({
    id: 'stationMap',
    stencil: false,
    depth: { enable: false },
    antialias: true,
    preserveDrawingBuffer: false,
    map: mapInstance,
    logoVisible: false,
  });

  scene.setBgColor('rgb(42, 42, 42)');

  scene.addImage('icon', PointIcon);
  scene.addImage('start', StartIcon);

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
    scene.on('moveend', () => {});
    scene.on('zoomchange', () => {});
  });
};

const setMapStatus = (drag, rotate) => {
  try {
    const amap = gaodeMap && gaodeMap.map;
    if (amap && typeof amap.setStatus === 'function') {
      amap.setStatus({ dragEnable: !!drag, rotateEnable: !!rotate });
    }
  } catch (e) {
    console.error('设置地图状态失败:', e);
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

  // 视野适配到影像范围
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
    ElMessage.error('坐标转换失败，请检查输入坐标是否合法。');
    return [
      [minLon, minLat],
      [maxLon, maxLat],
    ];
  }
};

const uploadGeoTiffFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const bbox = image.getBoundingBox();
    const geoKeys = image.getGeoKeys?.() || image.geoKeys || {};
    const projectedCode = geoKeys.ProjectedCSTypeGeoKey;
    const geographicCode = geoKeys.GeographicTypeGeoKey;

    let minLonTransformed, minLatTransformed, maxLonTransformed, maxLatTransformed;

    if (projectedCode === 32650 || projectedCode === 32651) {
      if (projectedCode === 32650) {
        proj4.defs('EPSG:32650', '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs');
      } else if (projectedCode === 32651) {
        proj4.defs('EPSG:32651', '+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs');
      }
      const epsgString = `EPSG:${projectedCode}`;

      const c1 = proj4(epsgString, 'EPSG:4326', [bbox[0], bbox[1]]);
      const c3 = proj4(epsgString, 'EPSG:4326', [bbox[2], bbox[3]]);

      minLonTransformed = c1[0];
      minLatTransformed = c1[1];
      maxLonTransformed = c3[0];
      maxLatTransformed = c3[1];
    } else if (
      geographicCode === 4326 ||
      geographicCode === 4490 ||
      (!projectedCode && !geographicCode) ||
      geographicCode === 4326
    ) {
      minLonTransformed = bbox[0];
      minLatTransformed = bbox[1];
      maxLonTransformed = bbox[2];
      maxLatTransformed = bbox[3];
    } else {
      ElMessage.error(
        `Unsupported EPSG code. Projected: ${projectedCode}, Geographic: ${geographicCode}. Only EPSG:32650, 32651, and 4326 are supported.`,
      );
      return;
    }

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
      ElMessage.error('影像编码失败，请重试。');
      return;
    }
    const url = URL.createObjectURL(blob);
    uploadedImageUrl.value = url;
    imageUrl.value = url;
  } catch (err) {
    console.error(err);
    ElMessage.error('GeoTIFF 解析失败或文件过大。');
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
    const projectedCode = geoKeys.ProjectedCSTypeGeoKey;
    const geographicCode = geoKeys.GeographicTypeGeoKey;

    let minLonTransformed, minLatTransformed, maxLonTransformed, maxLatTransformed;

    if (projectedCode === 32650 || projectedCode === 32651) {
      if (projectedCode === 32650) {
        proj4.defs('EPSG:32650', '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs');
      } else if (projectedCode === 32651) {
        proj4.defs('EPSG:32651', '+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs');
      }
      const epsgString = `EPSG:${projectedCode}`;

      const c1 = proj4(epsgString, 'EPSG:4326', [bbox[0], bbox[1]]);
      const c3 = proj4(epsgString, 'EPSG:4326', [bbox[2], bbox[3]]);

      minLonTransformed = c1[0];
      minLatTransformed = c1[1];
      maxLonTransformed = c3[0];
      maxLatTransformed = c3[1];
    } else if (
      geographicCode === 4326 ||
      geographicCode === 4490 ||
      (!projectedCode && !geographicCode) ||
      geographicCode === 4326
    ) {
      minLonTransformed = bbox[0];
      minLatTransformed = bbox[1];
      maxLonTransformed = bbox[2];
      maxLatTransformed = bbox[3];
    } else {
      ElMessage.error(
        `Unsupported EPSG code. Projected: ${projectedCode}, Geographic: ${geographicCode}. Only EPSG:32650, 32651, and 4326 are supported.`,
      );
      return;
    }

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
      ElMessage.error('影像编码失败，请重试。');
      return;
    }
    const outUrl = URL.createObjectURL(blob);
    uploadedImageUrl.value = outUrl;
    imageUrl.value = outUrl;
  } catch (err) {
    console.error(err);
    ElMessage.error('GeoTIFF 解析失败或文件过大。');
  }
};

const loadTiffFile = async (file) => {
  try {
    await uploadGeoTiffFile(file);
    addOrthophoto();
  } catch (e) {
    console.error(e);
    ElMessage.error('TIF 文件加载失败');
  }
};

const loadTiffUrl = async (url) => {
  try {
    await uploadGeoTiffFromUrl(url);
    addOrthophoto();
  } catch (e) {
    console.error(e);
    ElMessage.error('TIF 文件加载失败');
  }
};

const clearOrthophoto = () => {
  try {
    if (orthophotoLayer && scene) {
      scene.removeLayer(orthophotoLayer);
      orthophotoLayer = null;
    }
    uploadedImageUrl.value = null;
    imageUrl.value = null;
    scene && scene.render();
  } catch (e) {
    console.log('e', e);
  }
};

const hideOrthophoto = () => {
  try {
    if (orthophotoLayer) {
      if (typeof orthophotoLayer.hide === 'function') {
        orthophotoLayer.hide();
      }
      scene && scene.render();
    }
  } catch (e) {
    console.log('e', e);
  }
};

const ensureImageVisible = () => {
  if (orthophotoLayer) {
    orthophotoLayer.show();
    scene && scene.render();
  }
};

const startEdit = () => {
  editing.value = true;
  emits('update:editing', true);
  showEditHandles(true);
};

const onCancel = () => {
  editing.value = false;
  emits('update:editing', false);
  if (savedCoords.value && savedCoords.value.length) {
    polygonCoords.value = JSON.parse(JSON.stringify(savedCoords.value));
    drawPolygon();
  }
  showEditHandles(false);
};

const onSave = () => {
  savedCoords.value = JSON.parse(JSON.stringify(polygonCoords.value));
  emits('polygon-updated', savedCoords.value);
  editing.value = false;
  emits('update:editing', false);
  showEditHandles(false);
};

let vertexMarkers = [];
let draggingIndex = -1;
let polygonDragging = false;
let polygonDragStart = null;
let polygonDragOrigin = null;

const drawPolygon = () => {
  if (currentPolygonLayerKey == null) return;
  const coords = polygonCoords.value || [];
  const fc = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
      },
    ],
  };
  const prev = polygonLayers[currentPolygonLayerKey];
  if (prev) {
    scene.removeLayer(prev);
    polygonLayers[currentPolygonLayerKey] = null;
  }
  const key = currentPolygonLayerKey;
  const layer = new PolygonLayer({ zIndex: 150 }).source(fc).shape('fill').color('#2389FF').style({
    opacity: 0.2,
    stroke: '#2389FF',
    strokeOpacity: 1,
    lineWidth: 3,
    strokeWidth: 3,
    enableStroke: true,
    enableStroke: true,
  });
  polygonLayers[key] = layer;
  polygonCoordsMap[key] = JSON.parse(JSON.stringify(coords));
  layer.on('click', () => {
    if (!editing.value) return;
    if (currentPolygonLayerKey !== key) {
      currentPolygonLayerKey = key;
      const c = polygonCoordsMap[key];
      if (c && Array.isArray(c) && c.length) {
        polygonCoords.value = JSON.parse(JSON.stringify(c));
        refreshHandles();
      }
    }
  });
  scene.addLayer(layer);
  if (orthophotoLayer) {
    orthophotoLayer.show();
  }
  scene.render();
  refreshHandles();
};

const createPolygon = (coords) => {
  if (!Array.isArray(coords) || coords.length < 3) return;
  const first = coords[0];
  const last = coords[coords.length - 1];
  const closed = first && last && first[0] === last[0] && first[1] === last[1];
  polygonCoords.value = closed ? coords : [...coords, first];
  polygonLayerId++;
  currentPolygonLayerKey = polygonLayerId;
  polygonCoordsMap[currentPolygonLayerKey] = JSON.parse(JSON.stringify(polygonCoords.value));
  polygonInitialCoordsMap[currentPolygonLayerKey] = JSON.parse(JSON.stringify(polygonCoords.value));
  polygonHiddenMap[currentPolygonLayerKey] = false;
  drawPolygon();
  editing.value = true;
  emits('update:editing', true);
  showEditHandles(true);
  try {
    const payload = {
      key: currentPolygonLayerKey,
      coords: JSON.parse(JSON.stringify(polygonCoords.value)),
    };
    emits('polygon-created', payload);
  } catch (e) {
    console.log('e', e);
  }
};

const togglePolygonVisibility = (key, visible) => {
  const layer = polygonLayers[key];
  if (!layer) return;
  if (visible) {
    try {
      if (typeof layer.show === 'function') {
        layer.show();
      } else {
        scene.addLayer(layer);
      }
      if (orthophotoLayer) orthophotoLayer.show();
      scene.render();
    } catch (e) {
      console.log('e', e);
    }
    polygonHiddenMap[key] = false;
  } else {
    try {
      if (typeof layer.hide === 'function') {
        layer.hide();
      } else {
        scene.removeLayer(layer);
      }
    } catch (e) {
      console.log('e', e);
    }
    polygonHiddenMap[key] = true;
    if (currentPolygonLayerKey === key) {
      clearHandles();
    }
  }
};

const deletePolygon = (key) => {
  const layer = polygonLayers[key];
  if (layer) {
    try {
      scene.removeLayer(layer);
    } catch (e) {
      console.log('e', e);
    }
  }
  delete polygonLayers[key];
  delete polygonCoordsMap[key];
  delete polygonInitialCoordsMap[key];
  delete polygonHiddenMap[key];
  if (currentPolygonLayerKey === key) {
    currentPolygonLayerKey = null;
    clearHandles();
  }
};

const resetPolygon = (key) => {
  const init = polygonInitialCoordsMap[key];
  if (!init || !init.length) return;
  currentPolygonLayerKey = key;
  polygonCoords.value = JSON.parse(JSON.stringify(init));
  polygonCoordsMap[key] = JSON.parse(JSON.stringify(init));
  polygonHiddenMap[key] = false;
  drawPolygon();
  try {
    const payload = { key, coords: JSON.parse(JSON.stringify(polygonCoords.value)) };
    emits('polygon-updated', payload);
  } catch (e) {
    console.log('e', e);
  }
};

const refreshHandles = () => {
  if (currentPolygonLayerKey == null) {
    showEditHandles(false);
    return;
  }
  const coords = polygonCoords.value;
  if (!coords || !coords.length) {
    showEditHandles(false);
    return;
  }

  clearHandles();
  if (!editing.value) return;
  for (let i = 0; i < polygonCoords.value.length - 1; i++) {
    const a = polygonCoords.value[i];
    const b = polygonCoords.value[i + 1] || polygonCoords.value[0];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    const marker = new Marker({ offsets: [0, 0] }).setLnglat([a[0], a[1]]);
    const el = document.createElement('div');
    el.style.width = '10px';
    el.style.height = '10px';
    el.style.border = '2px solid #2389FF';
    el.style.borderRadius = '6px';
    el.style.background = '#fff';
    el.style.cursor = 'move';
    marker.setElement(el);
    el.addEventListener('mousedown', (evt) => {
      if (evt.button === 0 && ctrlPressed) {
        evt.preventDefault();
        evt.stopPropagation();
        draggingIndex = i;
        setMapStatus(false, false);
      }
    });
    el.addEventListener('dblclick', (evt) => {
      if (evt.button !== 0) return;
      evt.preventDefault();
      evt.stopPropagation();
      polygonCoords.value.splice(i + 1, 0, mid);
      polygonCoords.value[polygonCoords.value.length - 1] = polygonCoords.value[0];
      drawPolygon();
    });
    vertexMarkers.push(marker);
    scene.addMarker(marker);
  }
};

const clearHandles = () => {
  vertexMarkers.forEach((m) => m.remove());
  vertexMarkers = [];
};

const addRectangle = () => {
  const hasExtent = minLon.value && minLat.value && maxLon.value && maxLat.value;
  if (hasExtent) {
    const A = [minLon.value, minLat.value];
    const B = [maxLon.value, minLat.value];
    const C = [maxLon.value, maxLat.value];
    const D = [minLon.value, maxLat.value];
    const AB = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const BC = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const CD = [(C[0] + D[0]) / 2, (C[1] + D[1]) / 2];
    const DA = [(D[0] + A[0]) / 2, (D[1] + A[1]) / 2];
    const coords = [A, AB, B, BC, C, CD, D, DA, A];
    createPolygon(coords);
  } else {
    try {
      const amap = gaodeMap && gaodeMap.map;
      const center = amap && typeof amap.getCenter === 'function' ? amap.getCenter() : null;
      const bounds = amap && typeof amap.getBounds === 'function' ? amap.getBounds() : null;
      const sw = bounds && typeof bounds.getSouthWest === 'function' ? bounds.getSouthWest() : null;
      const ne = bounds && typeof bounds.getNorthEast === 'function' ? bounds.getNorthEast() : null;
      if (center && sw && ne) {
        const w = Math.abs(ne.getLng() - sw.getLng());
        const h = Math.abs(ne.getLat() - sw.getLat());
        const dx = w * 0.2;
        const dy = h * 0.2;
        const A0 = [center.getLng() - dx, center.getLat() - dy];
        const B0 = [center.getLng() + dx, center.getLat() - dy];
        const C0 = [center.getLng() + dx, center.getLat() + dy];
        const D0 = [center.getLng() - dx, center.getLat() + dy];
        const clamp = (lng, lat) => [
          Math.min(Math.max(lng, sw.getLng()), ne.getLng()),
          Math.min(Math.max(lat, sw.getLat()), ne.getLat()),
        ];
        const A = clamp(A0[0], A0[1]);
        const B = clamp(B0[0], B0[1]);
        const C = clamp(C0[0], C0[1]);
        const D = clamp(D0[0], D0[1]);
        const AB = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        const BC = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
        const CD = [(C[0] + D[0]) / 2, (C[1] + D[1]) / 2];
        const DA = [(D[0] + A[0]) / 2, (D[1] + A[1]) / 2];
        const coords = [A, AB, B, BC, C, CD, D, DA, A];
        createPolygon(coords);
      } else {
        const c = props.center;
        const d = 0.002;
        const A = [c[0] - d, c[1] - d];
        const B = [c[0] + d, c[1] - d];
        const C = [c[0] + d, c[1] + d];
        const D = [c[0] - d, c[1] + d];
        const AB = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        const BC = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
        const CD = [(C[0] + D[0]) / 2, (C[1] + D[1]) / 2];
        const DA = [(D[0] + A[0]) / 2, (D[1] + A[1]) / 2];
        const coords = [A, AB, B, BC, C, CD, D, DA, A];
        createPolygon(coords);
      }
    } catch (e) {
      const c = props.center;
      const d = 0.002;
      const A = [c[0] - d, c[1] - d];
      const B = [c[0] + d, c[1] - d];
      const C = [c[0] + d, c[1] + d];
      const D = [c[0] - d, c[1] + d];
      const AB = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      const BC = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
      const CD = [(C[0] + D[0]) / 2, (C[1] + D[1]) / 2];
      const DA = [(D[0] + A[0]) / 2, (D[1] + A[1]) / 2];
      const coords = [A, AB, B, BC, C, CD, D, DA, A];
      createPolygon(coords);
    }
  }
};

const pointInPolygon = (lng, lat, coords) => {
  const pts = coords.slice(0, -1);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const onSceneMouseDown = (e) => {
  if (!editing.value) return;
  if (!ctrlPressed) return;
  const pos = e.lnglat;
  if (!pos) return;
  const keys = Object.keys(polygonCoordsMap);
  for (let idx = 0; idx < keys.length; idx++) {
    const k = Number(keys[idx]);
    const coords = polygonCoordsMap[k];
    if (!coords || !coords.length) continue;
    if (pointInPolygon(pos.lng, pos.lat, coords)) {
      if (currentPolygonLayerKey !== k) {
        currentPolygonLayerKey = k;
        polygonCoords.value = JSON.parse(JSON.stringify(coords));
        refreshHandles();
      }
      polygonDragging = true;
      polygonDragStart = pos;
      polygonDragOrigin = JSON.parse(JSON.stringify(polygonCoords.value));
      setMapStatus(false, false);
      return;
    }
  }
};

const showEditHandles = (show) => {
  if (show) {
    refreshHandles();
    scene.on('mousemove', onMouseMove);
    scene.on('mousedown', onSceneMouseDown);
    window.addEventListener('mouseup', onMouseUp);
  } else {
    scene.off('mousemove', onMouseMove);
    scene.off('mousedown', onSceneMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    clearHandles();
  }
};

const onMouseMove = (e) => {
  const pos = e.lnglat;
  if (!pos) return;
  if (polygonDragging) {
    const dx = pos.lng - polygonDragStart.lng;
    const dy = pos.lat - polygonDragStart.lat;
    polygonCoords.value = polygonDragOrigin.map((p) => [p[0] + dx, p[1] + dy]);
    polygonCoords.value[polygonCoords.value.length - 1] = polygonCoords.value[0];
    drawPolygon();
    return;
  }
  if (draggingIndex < 0) return;
  polygonCoords.value[draggingIndex] = [pos.lng, pos.lat];
  polygonCoords.value[polygonCoords.value.length - 1] = polygonCoords.value[0];
  drawPolygon();
};

const onMouseUp = () => {
  draggingIndex = -1;
  polygonDragging = false;
  setMapStatus(true, true);
  if (currentPolygonLayerKey != null && polygonCoords.value && polygonCoords.value.length) {
    polygonCoordsMap[currentPolygonLayerKey] = JSON.parse(JSON.stringify(polygonCoords.value));
    try {
      const payload = {
        key: currentPolygonLayerKey,
        coords: JSON.parse(JSON.stringify(polygonCoords.value)),
      };
      emits('polygon-updated', payload);
    } catch (e) {
      console.log('e', e);
    }
  }
};

const setPolygon = (coords) => {
  if (!Array.isArray(coords) || coords.length < 3) return;
  const first = coords[0];
  const last = coords[coords.length - 1];
  const closed = first && last && first[0] === last[0] && first[1] === last[1];
  if (currentPolygonLayerKey == null || !polygonLayers[currentPolygonLayerKey]) {
    createPolygon(closed ? coords : [...coords, first]);
    return;
  }
  polygonCoords.value = closed ? coords : [...coords, first];
  polygonCoordsMap[currentPolygonLayerKey] = JSON.parse(JSON.stringify(polygonCoords.value));
  drawPolygon();
};

const setCurrentPolygonKey = (key) => {
  if (key == null) {
    currentPolygonLayerKey = null;
    clearHandles();
    return;
  }
  currentPolygonLayerKey = key;
  const coords = polygonCoordsMap[key];
  if (coords && Array.isArray(coords) && coords.length) {
    polygonCoords.value = JSON.parse(JSON.stringify(coords));
    refreshHandles();
  }
};

const hidePolygon = () => {
  const layer = polygonLayers[currentPolygonLayerKey];
  if (layer) {
    scene.removeLayer(layer);
    polygonLayers[currentPolygonLayerKey] = null;
  }
  clearHandles();
};

const centerMapOnStation = () => {
  scene.setCenter(props.center);
};

defineExpose({
  loadTiffFile,
  loadTiffUrl,
  clearOrthophoto,
  hideOrthophoto,
  addRectangle,
  setPolygon,
  setCurrentPolygonKey,
  hidePolygon,
  ensureImageVisible,
  togglePolygonVisibility,
  deletePolygon,
  resetPolygon,
  startEdit,
  onCancel,
  onSave,
});
</script>

<style lang="scss" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  .operate-manual {
    position: absolute;
    left: 16px;
    top: 16px;
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
  .operate {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
  }
  .map-content {
    width: 100%;
    height: 100%;
    position: relative;
    :deep(.amap-logo) {
      display: none !important;
    }
    :deep(.amap-copyright) {
      display: none !important;
    }
  }
  .current-position {
    position: absolute;
    bottom: 30px;
    right: 20px;
    cursor: pointer;
    img {
      width: 48px;
      height: 48px;
    }
  }
}
</style>
