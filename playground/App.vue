<template>
  <div class="app-container">
    <div class="nav">
      <button @click="currentView = 'preview'" :class="{ active: currentView === 'preview' }">
        Preview Map
      </button>
      <button @click="currentView = 'preview3D'" :class="{ active: currentView === 'preview3D' }">
        Preview 3DMap
      </button>
      <button @click="currentView = 'station'" :class="{ active: currentView === 'station' }">
        Station Model
      </button>
    </div>

    <div class="content">
      <div v-if="currentView === 'preview'" class="demo-box">
        <PreviewMap
          :center="[120.123, 30.123]"
          :zoom="12"
          :kml-url="kmlUrl"
          :ortho-photo-url="tiffUrl"
          :show-ortho-photo="true"
          :flight-route="flyRouteData"
          :regions="regionsData"
          @map-loaded="onMapLoaded"
        />
      </div>
      <div v-if="currentView === 'preview3D'" class="demo-box">
        <ThreeDimensionalMap
          :wall-geo-json="wallData"
          :area-geo-json="areaData"
          :texture-map="textureUrl"
          :center="[120.041663, 31.454729]"
          :zoom="9"
          :fly-data="flyData"
        />
      </div>

      <div v-if="currentView === 'station'" class="demo-box">
        <StationModel
          :center="[116.397428, 39.90923]"
          :initial-data="mockStationData"
          @save="onStationSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ThreeDimensionalMap, PreviewMap, StationModel } from '../src/index.js';
import wallData from '../src/data/wuxi.json';
import areaData from '../src/data/wuxi_xian.json';
import textureUrl from '../src/assets/image/wuxi-texture.png';
import { flyData, flyRouteData, regionsData } from '../src/data/config.js';


import kmlUrl from '../data/default.kml?url';
import tiffUrl from '../data/default.tif?url';

const currentView = ref('preview');

const onMapLoaded = (scene) => {
  console.log('Preview Map Loaded', scene);
};

const mockStationData = ref({
  id: 'station-123',
  ortho_photo_url: tiffUrl,
  show_ortho_photo: true,
  show_boundary: true,
  boundary_points: [
    { longitude: 116.396, latitude: 39.908 },
    { longitude: 116.398, latitude: 39.908 },
    { longitude: 116.398, latitude: 39.91 },
    { longitude: 116.396, latitude: 39.91 },
  ],
  is_inspection_area_divided: true,
  regions: [
    {
      id: 'region-1',
      name: 'Test Area 1',
      is_visible: true,
      boundary: [
        { longitude: 116.3965, latitude: 39.9085 },
        { longitude: 116.3975, latitude: 39.9085 },
        { longitude: 116.3975, latitude: 39.9095 },
        { longitude: 116.3965, latitude: 39.9095 },
      ],
    },
  ],
  box_transformers: [
    {
      id: 'bt-1',
      name: 'Box Transformer 1',
      station_region_name: 'Test Area 1',
      open: true,
      pv_strings: [
        { name: 'String 1', id: 's-1' },
        { name: 'String 2', id: 's-2' },
      ],
    },
  ],
});

const onStationSave = (data) => {
  console.log('Station Saved:', data);
  alert('Saved! Check console for data.');
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

.nav {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background: #eee;
}

.nav button {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ccc;
  cursor: pointer;
}

.nav button.active {
  color: #fff;
  background: #007bff;
  border-color: #0056b3;
}

.content {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.demo-box {
  width: 100%;
  height: 100%;
}
</style>
