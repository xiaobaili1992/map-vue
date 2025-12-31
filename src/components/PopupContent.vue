<template>
  <div class="popup-content">
    <img :src="CloseIcon" class="close-icon" @click="onClose && onClose()" />
    <div class="popup-content-top">
      <div class="imgs">
        <img :src="url1" class="img" @click="openFullPreview(0)" />
        <img :src="url2" class="img" @click="openFullPreview(1)" />
      </div>
    </div>
    <div class="popup-content-bottom">
      <div class="bottom-item">
        <img :src="PositionIcon" class="icon" />
        <span>{{ index }}号点位</span>
      </div>
      <img :src="PreviewIcon" class="icon" @click="openFullPreview(0)" />
    </div>
    <img :src="ArrowBottomIcon" class="arrow-bottom-icon" />
  </div>
  <Teleport to="body">
    <el-image-viewer
      v-if="viewerVisible"
      :url-list="[url1, url2]"
      :initial-index="initialIndex"
      @close="viewerVisible = false"
    />
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { ElImageViewer } from 'element-plus';
import CloseIcon from '../assets/image/close-icon.png';
import PositionIcon from '../assets/image/position-icon.png';
import PreviewIcon from '../assets/image/preview-icon.png';
import ArrowBottomIcon from '../assets/image/arrow-bottom-icon.png';

defineProps({
  url1: { type: String, default: '' },
  url2: { type: String, default: '' },
  index: { type: Number, default: 0 },
  onClose: { type: Function, default: null },
});

const viewerVisible = ref(false);
const initialIndex = ref(0);
const openFullPreview = (idx) => {
  initialIndex.value = idx || 0;
  viewerVisible.value = true;
};
</script>

<style lang="scss" scoped>
.popup-content {
  position: relative;
  z-index: 3000;
  width: 400px;

  .close-icon {
    position: absolute;
    top: -8px;
    right: -8px;
    z-index: 1;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .popup-content-top {
    box-sizing: border-box;
    width: 100%;
    height: 177px;
    padding: 8px;
    background: rgb(0 10 27 / 70%);
    border: 1px solid #8bc0ff;
    border-radius: 4px 4px 0 0;
    box-shadow: inset 0 1px 8px 3px rgb(106 175 255 / 50%);
    backdrop-filter: blur(1px);

    .imgs {
      display: flex;
      gap: 8px;
      align-items: center;

      .img {
        width: 187px;
        height: 160px;
        object-fit: cover;
        border-radius: 4px;
      }
    }
  }

  .popup-content-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    padding: 0 16px;
    background: rgb(0 10 27 / 70%);
    border: 1px solid #8bc0ff;
    border-radius: 0 0 3px 3px;
    box-shadow: inset 0 1px 8px 3px rgb(106 175 255 / 50%);
    backdrop-filter: blur(1px);

    img {
      width: 14px;
      height: 14px;
      cursor: pointer;
    }

    .bottom-item {
      display: flex;
      gap: 4px;
      align-items: center;

      span {
        height: 20px;
        color: rgb(255 255 255 / 70%);
        font-size: 14px;
        font-family: PingFangSC, 'PingFang SC';
        font-style: normal;
        line-height: 20px;
        text-align: left;
      }
    }
  }

  .arrow-bottom-icon {
    position: absolute;
    bottom: -16px;
    left: 50%;
    z-index: 1;
    width: 24px;
    height: 20px;
    transform: translateX(-50%);
  }
}

/* 作用到 Teleport 到 body 的全屏预览控件，确保按钮与图标显示 */
:deep(.ep-image-viewer__wrapper),
:deep(.el-image-viewer__wrapper) {
  z-index: 9999;
}
:deep(.ep-image-viewer__btn),
:deep(.el-image-viewer__btn),
:deep(.ep-image-viewer__prev),
:deep(.el-image-viewer__prev),
:deep(.ep-image-viewer__next),
:deep(.el-image-viewer__next),
:deep(.ep-image-viewer__close),
:deep(.el-image-viewer__close),
:deep(.ep-image-viewer__actions),
:deep(.el-image-viewer__actions) {
  color: #fff;
}
:deep(.ep-image-viewer__close .ep-icon),
:deep(.el-image-viewer__close .el-icon),
:deep(.ep-image-viewer__btn .ep-icon),
:deep(.el-image-viewer__btn .el-icon),
:deep(.ep-image-viewer__actions .ep-icon),
:deep(.el-image-viewer__actions .el-icon) {
  width: 24px;
  height: 24px;
}
</style>
