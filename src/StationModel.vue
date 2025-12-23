<template>
  <div class="station-model">
    <div class="station-model-left">
      <StationMap
        ref="mapRef"
        :center="center"
        v-model:editing="editing"
        :map-token="mapToken"
        :map-style="mapStyle"
        @polygon-created="onPolygonCreated"
        @polygon-updated="onPolygonUpdated"
      />
      <div class="operate">
        <el-button v-if="!editing && !readOnly" type="primary" @click="onStartEdit">编辑</el-button>
        <div v-else-if="editing">
          <el-button @click="onCancelEdit">取消</el-button>
          <el-button type="primary" @click="onSaveEdit">保存</el-button>
        </div>
      </div>
      <div v-if="renderLoading" class="render-loading">
        <el-icon class="spinner" size="24"><Loading /></el-icon>
        <span>正射影像渲染中...</span>
      </div>
    </div>
    <div class="station-model-right">
      <div class="station-content">
        <SubTitle title="电站建模" />
        <div class="station-model-tiff">
          <div class="tiff-title">
            <span class="title">电站正射影像</span>
            <div
              class="download"
              @click="editing && openTiffDialog()"
              :style="{ cursor: editing ? 'pointer' : 'not-allowed' }"
            >
              <el-icon size="14" :color="tiffUploaded ? '#1CB866' : '#FF5630'">
                <CircleCheckFilled v-if="tiffUploaded" />
                <WarningFilled v-else />
              </el-icon>
              {{ tiffUploaded ? '已上传' : '未上传' }}
            </div>
          </div>
          <el-switch
            v-model="orthophotoEnabled"
            :disabled="!editing || !tiffUploaded"
            @change="onOrthophotoToggle"
          />
        </div>
        <div class="station-model-boundary">
          <div class="tiff-title">
            <span class="title">电站边界</span>
            <el-tooltip :content="boundaryText" placement="top">
              <div class="boundary">{{ boundaryText }}</div>
            </el-tooltip>
          </div>
          <el-switch :disabled="!editing" v-model="boundaryEnabled" @change="onBoundaryToggle" />
        </div>
        <div class="station-model-area">
          <div class="area-top">
            <div class="area-title">
              <span class="title">巡检区域划分</span>
              <el-tooltip content="若一次飞行无法完成巡检，可进行区域划分" placement="top">
                <el-icon size="14" color="#999"><WarningFilled /></el-icon>
              </el-tooltip>
            </div>
            <el-switch v-model="showArea" :disabled="!editing" @change="onAreaToggle" />
          </div>
          <div class="area-table-container" v-if="showArea">
            <el-table :data="areas" class="area-table">
              <template #empty>
                <el-empty description="暂无数据" />
              </template>
              <el-table-column prop="name" label="区域名称" width="100" />
              <el-table-column label="区域定位" width="300" showOverflowTooltip="true">
                <template #default="{ row }">{{ formatAreaCoords(row) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="90">
                <template #default="{ row, $index }">
                  <img
                    class="operate-icon"
                    :src="row.visible ? EyeShowIcon : EyeHideIcon"
                    alt="显示隐藏"
                    @click="editing && toggleArea($index)"
                    :style="{
                      cursor: editing ? 'pointer' : 'not-allowed',
                      opacity: editing ? 1 : 0.5,
                    }"
                  />
                  <img
                    class="operate-icon"
                    :src="ResetIcon"
                    alt="重置"
                    @click="editing && resetArea($index)"
                    :style="{
                      cursor: editing ? 'pointer' : 'not-allowed',
                      opacity: editing ? 1 : 0.5,
                    }"
                  />
                  <img
                    class="operate-icon"
                    :src="DeleteIcon"
                    alt="删除"
                    @click="editing && deleteArea($index)"
                    :style="{
                      cursor: editing ? 'pointer' : 'not-allowed',
                      opacity: editing ? 1 : 0.5,
                    }"
                  />
                </template>
              </el-table-column>
            </el-table>
            <div class="add-area-container">
              <div
                class="add-area"
                @click="editing && addRectangle()"
                :style="{ cursor: editing ? 'pointer' : 'not-allowed', opacity: editing ? 1 : 0.5 }"
              >
                <el-icon><Plus /></el-icon>
                新增
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="string-content">
        <div class="sub-title">
          <div class="title-text">组串建模</div>
        </div>
        <div class="area-container" v-if="boxTransformersData?.length > 0">
          <div class="string-content-area" v-for="item in boxTransformersData" :key="item.id">
            <div class="area-top">
              <div class="area-title">
                <span class="title">{{ item.name }}</span>
              </div>
              <div class="select-area">
                <el-select
                  style="width: 160px"
                  v-model="item.station_region_name"
                  placeholder="请选择区域"
                  :disabled="!editing"
                  v-if="showArea"
                >
                  <el-option
                    :label="area.name"
                    :value="area.name"
                    v-for="area in areas"
                    :key="area.name"
                  />
                </el-select>
                <el-icon
                  size="20"
                  color="#2355D8"
                  style="cursor: pointer"
                  @click="toggleStrings(item)"
                >
                  <CaretTop v-if="item.open" />
                  <CaretBottom v-else />
                </el-icon>
              </div>
            </div>
            <el-table v-if="item.open" :data="item.pv_strings" class="area-table" height="300">
              <template #empty>
                <el-empty description="暂无数据" />
              </template>
              <el-table-column prop="name" label="组串名称" width="100" />
              <el-table-column
                prop="position"
                label="组串定位"
                width="270"
                showOverflowTooltip="true"
              >
                /
              </el-table-column>
              <el-table-column prop="address" label="操作" width="120">/</el-table-column>
            </el-table>
          </div>
        </div>
        <div class="empty-container" v-else>
          <el-empty description="暂无数据" />
        </div>
      </div>
    </div>
  </div>

  <UploadTiff v-model="tiffDialogVisible" :initial-url="tiffUrlRef" @confirm="onTiffConfirm" />
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits, watch } from 'vue';
import StationMap from './StationMap.vue';
import UploadTiff from './UploadTiff.vue';
import SubTitle from './components/SubTitle.vue';
import {
  CircleCheckFilled,
  WarningFilled,
  CaretTop,
  CaretBottom,
  Plus,
  Loading,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import EyeShowIcon from './assets/image/eye-show-icon.png';
import EyeHideIcon from './assets/image/eye-hide-icon.png';
import ResetIcon from './assets/image/reset-icon.png';
import DeleteIcon from './assets/image/delete-icon.png';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  center: {
    type: Array,
    default: () => [119.436345, 44.458526],
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  mapToken: {
    type: String,
    default: '012996f37c22ab7267725dc3a2840f88',
  },
  mapStyle: {
    type: String,
    default: 'amap://styles/dark',
  },
});

const emit = defineEmits(['save', 'upload-tiff', 'cancel']);

const areas = ref([]);
const addingArea = ref(false);
const boundaryKey = ref(null);
const creatingBoundary = ref(false);
const creatingAreaIndex = ref(-1);

const mapRef = ref(null);
const tiffDialogVisible = ref(false);
const tiffUploaded = ref(false);
const orthophotoEnabled = ref(false);
const editing = ref(false);
const boundaryEnabled = ref(false);
const boundaryCoords = ref([]);
const renderLoading = ref(false);
const showArea = ref(false);
const boxTransformersData = ref([]);
const tiffUrlRef = ref('');
const currentModelId = ref('');
const initialState = ref(null);

const boundaryText = computed(() => {
  if (!tiffUploaded.value || !boundaryEnabled.value || !boundaryCoords.value.length) return '';
  const pairs = boundaryCoords.value.map((p) => `[${p[0].toFixed(6)},${p[1].toFixed(6)}]`);
  return pairs.join(',');
});

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      initData(newVal);
    }
  },
  { deep: true, immediate: true },
);

function initData(data) {
  const {
    id,
    ortho_photo_url,
    show_ortho_photo,
    show_boundary,
    boundary_points,
    is_inspection_area_divided,
    regions,
    box_transformers = [],
  } = data || {};

  currentModelId.value = id || '';
  tiffUrlRef.value = ortho_photo_url || '';
  orthophotoEnabled.value = !!show_ortho_photo;
  boundaryEnabled.value = !!show_boundary;
  boundaryCoords.value = Array.isArray(boundary_points)
    ? boundary_points.map((p) => [p.longitude, p.latitude])
    : [];
  showArea.value = !!is_inspection_area_divided;
  boxTransformersData.value = box_transformers || [];
  areas.value =
    (Array.isArray(regions)
      ? regions.map((r) => ({
          id: r.id ?? r.name ?? Math.random(),
          name: r.name ?? '区域',
          coords: Array.isArray(r.boundary_points)
            ? r.boundary_points.map((p) => [p.longitude, p.latitude])
            : Array.isArray(r.coords)
              ? r.coords
              : [],
          visible: !!r.is_visible,
        }))
      : []) || [];

  tiffUploaded.value = !!ortho_photo_url;

  initialState.value = JSON.parse(
    JSON.stringify({
      tiffUrlRef: tiffUrlRef.value,
      orthophotoEnabled: orthophotoEnabled.value,
      boundaryEnabled: boundaryEnabled.value,
      boundaryCoords: boundaryCoords.value,
      showArea: showArea.value,
      areas: areas.value,
      boxTransformersData: boxTransformersData.value,
      tiffUploaded: tiffUploaded.value,
    }),
  );

  // Defer map rendering until mounted or next tick
  setTimeout(() => {
    if (ortho_photo_url && mapRef.value) {
      renderLoading.value = true;
      mapRef.value.loadTiffUrl(ortho_photo_url).finally(() => {
        renderLoading.value = false;
        if (show_ortho_photo) mapRef.value?.ensureImageVisible();
      });
    }
    renderInitialGraphics();
  }, 1000);
}

const openTiffDialog = () => {
  tiffDialogVisible.value = true;
};

const onTiffConfirm = async (payload) => {
  try {
    renderLoading.value = true;
    const url = payload?.url || '';
    const file = payload?.file || null;
    if (file) {
      // Local file selected
      // tiffUrlRef.value = url; // Might be blob url or empty if not uploaded yet
      tiffUploaded.value = true;
      orthophotoEnabled.value = true;
      await mapRef.value?.loadTiffFile(file);
      mapRef.value?.ensureImageVisible();
      emit('upload-tiff', { file });
    } else if (url) {
      tiffUrlRef.value = url;
      tiffUploaded.value = true;
      orthophotoEnabled.value = true;
      await mapRef.value?.loadTiffUrl(url);
      mapRef.value?.ensureImageVisible();
    } else {
      tiffUrlRef.value = '';
      tiffUploaded.value = false;
      orthophotoEnabled.value = false;
      mapRef.value?.clearOrthophoto?.();
    }
  } finally {
    renderLoading.value = false;
    tiffDialogVisible.value = false;
  }
};

const addRectangle = () => {
  addingArea.value = true;
  mapRef.value?.addRectangle();
  if (orthophotoEnabled.value) {
    mapRef.value?.ensureImageVisible();
  }
};

const nextAreaName = () => {
  const used = new Set(
    areas.value
      .map((a) => a.name)
      .map((n) => {
        const m = /^区域(\d+)$/.exec(n);
        return m ? Number(m[1]) : null;
      })
      .filter((x) => Number.isFinite(x)),
  );
  let i = 1;
  while (used.has(i)) i++;
  return `区域${i}`;
};

const onPolygonCreated = ({ key, coords }) => {
  if (addingArea.value) {
    if (creatingAreaIndex.value >= 0) {
      const row = areas.value[creatingAreaIndex.value];
      if (row) {
        row.id = key;
        row.coords = JSON.parse(JSON.stringify(coords));
        row.initialCoords = JSON.parse(JSON.stringify(coords));
        row.visible = !!row.visible;
        if (!row.visible) {
          mapRef.value?.togglePolygonVisibility(key, false);
        } else {
          mapRef.value?.setCurrentPolygonKey(key);
        }
      }
      creatingAreaIndex.value = -1;
      return;
    } else {
      const name = nextAreaName();
      areas.value.push({
        id: key,
        name,
        coords: JSON.parse(JSON.stringify(coords)),
        initialCoords: JSON.parse(JSON.stringify(coords)),
        visible: true,
      });
      addingArea.value = false;
      mapRef.value?.setCurrentPolygonKey(key);
      return;
    }
  }
  if (creatingBoundary.value) {
    boundaryKey.value = key;
    boundaryCoords.value = JSON.parse(JSON.stringify(coords));
    creatingBoundary.value = false;
    mapRef.value?.setCurrentPolygonKey(key);
    if (!boundaryEnabled.value) {
      mapRef.value?.togglePolygonVisibility(key, false);
    }
    return;
  }
};

const onPolygonUpdated = ({ key, coords }) => {
  const idx = areas.value.findIndex((a) => a.id === key);
  if (idx >= 0) {
    areas.value[idx].coords = JSON.parse(JSON.stringify(coords));
  }
  if (boundaryKey.value != null && key === boundaryKey.value) {
    boundaryCoords.value = JSON.parse(JSON.stringify(coords));
  }
};

const formatAreaCoords = (row) => {
  const coords = row.coords || [];
  if (!coords.length) return '';
  const pairs = coords
    .slice(0, coords.length - 1)
    .map((p) => `[${p[0].toFixed(6)},${p[1].toFixed(6)}]`);
  return pairs.join(',');
};

const toggleArea = (index) => {
  const row = areas.value[index];
  if (!row) return;
  const next = !row.visible;
  row.visible = next;
  mapRef.value?.togglePolygonVisibility(row.id, next);
  if (next) {
    mapRef.value?.setCurrentPolygonKey(row.id);
  } else {
    mapRef.value?.setCurrentPolygonKey(null);
  }
};

const resetArea = (index) => {
  const row = areas.value[index];
  if (!row) return;
  mapRef.value?.resetPolygon(row.id);
  row.coords = JSON.parse(JSON.stringify(row.initialCoords));
  row.visible = true;
  mapRef.value?.setCurrentPolygonKey(row.id);
};

const deleteArea = (index) => {
  const row = areas.value[index];
  if (!row) return;
  mapRef.value?.deletePolygon(row.id);
  areas.value.splice(index, 1);
};

const onBoundaryToggle = (val) => {
  if (!mapRef.value) return;
  if (val) {
    if (boundaryKey.value != null) {
      mapRef.value.togglePolygonVisibility(boundaryKey.value, true);
      mapRef.value.setCurrentPolygonKey(boundaryKey.value);
    } else {
      creatingBoundary.value = true;
      mapRef.value.addRectangle();
    }
  } else {
    if (boundaryKey.value != null) {
      mapRef.value.togglePolygonVisibility(boundaryKey.value, false);
    } else {
      mapRef.value.hidePolygon();
    }
  }
};

const onOrthophotoToggle = (val) => {
  if (!mapRef.value) return;
  if (val) {
    mapRef.value.ensureImageVisible?.();
  } else {
    mapRef.value.hideOrthophoto?.();
  }
};

const onAreaToggle = (val) => {
  showArea.value = val;
  if (!mapRef.value) return;
  if (val) {
    areas.value.forEach((a) => {
      a.visible = true;
      mapRef.value?.togglePolygonVisibility(a.id, true);
    });
    mapRef.value?.setCurrentPolygonKey(null);
  } else {
    areas.value.forEach((a) => {
      mapRef.value?.togglePolygonVisibility(a.id, false);
      a.visible = false;
    });
    mapRef.value?.setCurrentPolygonKey(null);
  }
};

const renderInitialGraphics = () => {
  if (!mapRef.value) return;
  if (Array.isArray(boundaryCoords.value) && boundaryCoords.value.length >= 3) {
    creatingBoundary.value = true;
    mapRef.value.setCurrentPolygonKey(null);
    mapRef.value.setPolygon(boundaryCoords.value);
  }
  if (Array.isArray(areas.value) && areas.value.length) {
    for (let i = 0; i < areas.value.length; i++) {
      const a = areas.value[i];
      if (Array.isArray(a.coords) && a.coords.length >= 3) {
        creatingAreaIndex.value = i;
        addingArea.value = true;
        mapRef.value.setCurrentPolygonKey(null);
        mapRef.value.setPolygon(a.coords);
      }
    }
    addingArea.value = false;
    creatingAreaIndex.value = -1;
  }
  mapRef.value.setCurrentPolygonKey(null);
  mapRef.value.onCancel();
};

const toggleStrings = (row) => {
  if (!row) return;
  row.open = !row.open;
};

const onStartEdit = () => {
  editing.value = true;
  mapRef.value?.startEdit();
};

const onCancelEdit = async () => {
  if (initialState.value) {
    if (boundaryKey.value) {
      mapRef.value?.deletePolygon(boundaryKey.value);
      boundaryKey.value = null;
    }
    if (areas.value && areas.value.length) {
      areas.value.forEach((area) => {
        if (area.id) mapRef.value?.deletePolygon(area.id);
      });
    }

    const state = JSON.parse(JSON.stringify(initialState.value));
    tiffUrlRef.value = state.tiffUrlRef;
    orthophotoEnabled.value = state.orthophotoEnabled;
    boundaryEnabled.value = state.boundaryEnabled;
    boundaryCoords.value = state.boundaryCoords;
    showArea.value = state.showArea;
    areas.value = state.areas;
    boxTransformersData.value = state.boxTransformersData;
    tiffUploaded.value = state.tiffUploaded;

    if (state.tiffUrlRef) {
      renderLoading.value = true;
      try {
        await mapRef.value?.loadTiffUrl(state.tiffUrlRef);
        if (state.orthophotoEnabled) {
          mapRef.value?.ensureImageVisible();
        } else {
          mapRef.value?.hideOrthophoto();
        }
      } finally {
        renderLoading.value = false;
      }
    } else {
      mapRef.value?.clearOrthophoto();
    }

    renderInitialGraphics();
  }
  editing.value = false;
  mapRef.value?.onCancel();
  emit('cancel');
};

const onSaveEdit = async () => {
  mapRef.value?.onSave();
  const payload = {
    id: currentModelId.value,
    ortho_photo_url: tiffUrlRef.value || '',
    show_ortho_photo: !!orthophotoEnabled.value,
    show_boundary: !!boundaryEnabled.value,
    boundary_points: Array.isArray(boundaryCoords.value)
      ? boundaryCoords.value?.map((p) => {
          const [longitude, latitude] = p;
          return {
            longitude,
            latitude,
          };
        })
      : [],
    is_inspection_area_divided: !!showArea.value,
    regions: areas.value.map((a) => ({
      name: a.name,
      is_visible: !!a.visible,
      boundary_points:
        a.coords?.map((p) => {
          const [longitude, latitude] = p;
          return {
            longitude,
            latitude,
          };
        }) || [],
    })),
    box_transformers: boxTransformersData.value.map((t) => {
      const { station_region_name, device_id, pv_strings } = t;
      return {
        station_model_id: currentModelId.value || '',
        station_region_name: showArea.value ? station_region_name : '',
        device_id,
        pv_strings: pv_strings?.map((pv) => {
          const { dc_ac_pv_id, is_visible, coordinate_points } = pv;
          return {
            dc_ac_pv_id,
            is_visible,
            coordinate_points: coordinate_points || [],
          };
        }),
      };
    }),
  };

  emit('save', payload);
  editing.value = false;
};
</script>

<style lang="scss" scoped>
.station-model {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 16px;
  gap: 16px;
  box-sizing: border-box;
  position: relative;
  .station-model-left {
    background-color: #fff;
    flex: 1;
    border-radius: 8px;
    position: relative;
    .operate {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      display: flex;
      gap: 8px;
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
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  .station-model-right {
    width: 550px;
    height: 100%;
    overflow-y: auto;
    position: relative;
    .station-content,
    .string-content {
      width: 100%;
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;
      box-sizing: border-box;

      .station-model-tiff,
      .station-model-boundary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        background: #ffffff;
        border-radius: 4px;
        border: 1px solid #f0f0f0;
        margin-top: 16px;
        .tiff-title {
          display: flex;
          align-items: center;
          gap: 12px;
          .title {
            height: 20px;
            font-family:
              PingFangSC,
              PingFang SC;
            font-size: 14px;
            color: #333333;
            line-height: 20px;
            text-align: left;
            font-style: normal;
            width: 88px;
          }
          .download {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #333;
          }
          .boundary {
            font-size: 12px;
            color: #999999;
            color: #333;
            width: 320px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      .station-model-area,
      .string-content {
        margin-top: 16px;
        border-radius: 4px;
        border: 1px solid #f0f0f0;
        .area-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #ffffff;
          .area-title {
            display: flex;
            align-items: center;
            gap: 12px;
            .title {
              height: 20px;
              font-family:
                PingFangSC,
                PingFang SC;
              font-size: 14px;
              color: #333333;
              line-height: 20px;
              text-align: left;
              font-style: normal;
            }
          }
        }
        .area-table-container {
          border-top: 1px solid #f0f0f0;
          .area-table {
            width: 100%;
            padding: 8px;
          }
        }
      }
    }
    .string-content {
      margin-top: 16px;
      height: calc(100% - 298px);
      overflow: hidden;
      .string-content-area {
        margin-top: 16px;
        border-radius: 4px;
        border: 1px solid #f0f0f0;
        &:last-child {
          margin-bottom: 16px;
        }
        .area-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #ffffff;
          border-bottom: 1px solid #f0f0f0;
          .area-title {
            display: flex;
            align-items: center;
            gap: 12px;
            .title {
              height: 20px;
              font-family:
                PingFangSC,
                PingFang SC;
              font-size: 14px;
              color: #333333;
              line-height: 20px;
              text-align: left;
              font-style: normal;
            }
          }
          .select-area {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
          }
        }
        .area-table {
          width: 100%;
          padding: 8px;
        }
      }
    }
    .add-area-container {
      padding: 0 8px 8px 8px;

      .add-area {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #333;
        height: 32px;
        background: rgba(35, 85, 216, 0.08);
        border-radius: 4px;
        border: 1px solid #2355d8;
        color: #2355d8;
        cursor: pointer;
        i {
          margin-top: -2px;
        }
      }
    }
    .operate-icon {
      width: 14px;
      height: 14px;
      cursor: pointer;
      margin-left: 8px;
      &:first-child {
        margin-left: 0;
      }
    }
    .area-container {
      height: 100%;
      overflow-y: auto;
    }
    .empty-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
