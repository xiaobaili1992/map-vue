<template>
  <div class="sub-title">
    <div class="title-text">{{ props.title }}</div>
    <slot name="right"></slot>
  </div>
</template>

<script setup name="SubTitle">
import { defineProps } from 'vue';
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.sub-title {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 16px;
  &:before {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    content: '';
    width: 4px;
    height: 14px;
    background: #2355d8;
    border-radius: 2px;
  }
  .title-text {
    color: #333;
    font-size: 16px;
    height: 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: bold;
    box-sizing: border-box;
    position: relative;
    font-weight: bold;
    white-space: nowrap;
    margin-left: 8px;
  }
}
</style>
