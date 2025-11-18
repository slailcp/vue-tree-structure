<script setup>
import { ref, computed } from "vue";

// 定义组件属性
const props = defineProps({
  chooseType: {
    type: Number,
    default: 2,
  },
  // 已选择的数据
  selectedItems: {
    type: Array,
    required: true,
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
});

// 定义事件
const emit = defineEmits(["remove-item"]);

// 计算属性：根据类型过滤已选择的项目
const filteredSelectedItems = computed(() => {
  let data = [];
  if (props.chooseType === 1) {
    // 只显示部门
    data = props.selectedItems.filter((item) => item.Level === 0 || item.Level === 1);
  } else if (props.chooseType === 2) {
    // 只显示员工
    data = props.selectedItems.filter((item) => item.Level === 2);
  } else {
    // 显示所有
    data = props.selectedItems;
  }
  const bm = props.selectedItems.filter((item) => item.Level === 0 || item.Level === 1);
  const yg = props.selectedItems.filter((item) => item.Level === 2);
  return [
    {
      title: "部门",
      showtit: yg.length && bm.length,
      list: bm,
      alltotal: props.selectedItems.length,
    },
    {
      title: "员工",
      showtit: yg.length && bm.length,
      list: yg,
      alltotal: props.selectedItems.length,
    },
  ];
});

// 移除已选择的项目
const removeSelectedItem = (item) => {
  if (props.disabled) return;
  emit("remove-item", item);
};

// 获取项目类型标签
const getItemTypeTag = (item) => {
  return item.Level === 1 ? "部门" : "员工";
};
// 对外暴露方法
defineExpose({});
</script>

<template>
  <div class="te-deep-right-panel">
    <div class="te-deep-panel-title">已选择({{ filteredSelectedItems.length ? filteredSelectedItems[0].alltotal : 0 }})</div>

    <div class="te-deep-selected-list">
      <div v-if="filteredSelectedItems.length === 0" class="te-deep-empty-data" style="margin-top: 0"></div>
      <div v-else>
        <div v-for="filter in filteredSelectedItems" :key="filter.PK_Guid">
          <div class="te-deep-select-title" v-if="filter.showtit">{{ filter.title }}</div>
          <div v-for="item in filter.list" :key="item.PK_Guid" class="te-deep-selected-item" :class="{ 'te-deep-margin-left-20': filter.showtit }">
            <i class="iconfont icon-bumen2" v-if="item.Level === 0 || item.Level === 1"></i>
            <i class="iconfont icon-yuangong" v-else></i>
            <span class="te-deep-select-item-name">{{ item.Name }}</span>
            <i class="iconfont icon-a-guanbilunkuohua te-deep-remove-btn" v-if="!disabled" @click="removeSelectedItem(item)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
