<template>
  <el-dialog
    :model-value="modelValue"
    title="上传正射影像"
    width="500px"
    @update:modelValue="updateVisible"
  >
    <div class="upload-wrap" v-loading="uploading">
      <el-upload
        drag
        :show-file-list="true"
        :file-list="fileList"
        :auto-upload="false"
        accept=".tif,.tiff"
        :on-change="onChange"
        :on-remove="onRemove"
      >
        <div class="upload-item">
          <img :src="UploadIcon" alt="upload-icon" />
          <div class="text">
            <span class="span2">可直接将待导入的文件拖拽到本区域，或</span>
            <span class="span1">点击上传</span>
          </div>
          <div class="desc">只能上传TIFF格式文件，且不超过200Mb</div>
        </div>
      </el-upload>
    </div>
    <template #footer>
      <el-button @click="updateVisible(false)" :disabled="uploading">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="uploading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';
import UploadIcon from '../assets/image/upload-icon.png';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initialUrl: { type: String, default: '' },
  uploadFn: { type: Function, default: null },
});
const emit = defineEmits(['update:modelValue', 'confirm']);

const selectedFile = ref(null);
const uploading = ref(false);
const fileList = ref([]);

const updateVisible = (val) => {
  emit('update:modelValue', val);
};

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      if (props.initialUrl) {
        const name =
          props.initialUrl.split('/').pop() ||
          props.initialUrl.split('?')[0]?.split('/').pop() ||
          'orthophoto.tiff';
        fileList.value = [{ name, url: props.initialUrl }];
      } else {
        fileList.value = [];
      }
      selectedFile.value = null;
    }
  },
);

const onChange = (file) => {
  const f = file?.raw || null;
  if (!f) {
    selectedFile.value = null;
    fileList.value = [];
    return;
  }
  if (f.size > 200 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过200MB');
    selectedFile.value = null;
    fileList.value = [];
    return;
  }
  selectedFile.value = f;
  fileList.value = [{ name: f.name }];
};

const onRemove = (file) => {
  fileList.value = [];
  if (selectedFile.value && file && file.name === selectedFile.value.name) {
    selectedFile.value = null;
  }
};

const onConfirm = async () => {
  if (selectedFile.value) {
    const name = selectedFile.value.name || '';
    if (!/\.(tif|tiff)$/i.test(name)) {
      ElMessage.error('仅支持.tif/.tiff文件');
      return;
    }
    if (selectedFile.value.size > 200 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过200MB');
      return;
    }

    if (props.uploadFn) {
      uploading.value = true;
      try {
        const url = await props.uploadFn(selectedFile.value);
        ElMessage.success('上传成功');
        emit('confirm', { url, file: selectedFile.value });
        updateVisible(false);
      } catch (err) {
        ElMessage.error(err.message || '上传失败');
      } finally {
        uploading.value = false;
      }
    } else {
      emit('confirm', { url: '', file: selectedFile.value });
      updateVisible(false);
    }
  } else {
    const url = fileList.value?.[0]?.url || '';
    emit('confirm', { url, file: null });
    updateVisible(false);
  }
};
</script>

<style lang="scss" scoped>
.upload-wrap {
  padding: 24px;
  .upload-item {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-direction: column;
    img {
      width: 72px;
      height: 72px;
    }
    .text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family:
        PingFangSC,
        PingFang SC;
      font-size: 16px;
      .span1 {
        color: #2355d8;
      }
      .span2 {
        color: #666666;
      }
    }
    .desc {
      font-family:
        PingFangSC,
        PingFang SC;
      font-size: 12px;
      color: #999999;
    }
  }
  ::v-deep(.ep-upload-dragger) {
    background: rgba(199, 218, 254, 0.08);
    border-radius: 4px;
  }
}
</style>
