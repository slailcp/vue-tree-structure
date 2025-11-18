<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import departmentList from "./DepartmentList.vue";
import searchBar from "./SearchBar.vue";
import selectedList from "./SelectedList.vue";
import "./style.less";
// 定义组件属性
const props = defineProps({
  // 选择类型：0-都不能选择 1-只能选择部门，2-只能选择员工，3-员工部门都可以选择
  chooseType: {
    type: Number,
    default: 2,
  },
  // 只展示当前部门下的数据
  scopeNode: {
    type: Object,
    default: () => null,
  },
  // 初始选中数据
  initData: {
    type: Array,
    default: () => [],
  },
  // 是否单选
  singleChoice: {
    type: Boolean,
    default: false,
  },
  // 请求的函数
  getDepListApi: {
    type: Function,
    default: () => {},
  },
  // 根面包屑名称()
  rootNodeName: {
    type: String,
    default: "全部",
  },
  pageSize: {
    type: Number,
    default: 15,
  },
});

// 定义事件
const emit = defineEmits(["confirm", "cancel"]);

// 已选择的数据
const selectedItems = ref([]);

// 子组件引用
const searchBarRef = ref(null);
const departmentListRef = ref(null);

// 计算属性：是否禁用操作
const isDisabled = computed(() => false);

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
const indexOfItem = (listRef, item) => listRef.value.findIndex((selected) => selected.PK_Guid === item.PK_Guid);
const setSelected = (items) => {
  selectedItems.value = deepClone(items);
};
const clearSearchIfNeeded = () => {
  if (searchBarRef.value) {
    searchBarRef.value.clearSearch();
  }
};
const initChildComponents = () => {
  if (departmentListRef.value) {
    departmentListRef.value.initLoad();
  }
  clearSearchIfNeeded();
};
const applySingleChoiceBehavior = (index) => {
  if (props.singleChoice) {
    if (index !== -1) {
      selectedItems.value = [];
      return true;
    } else {
      selectedItems.value = [];
    }
  }
  return false;
};

// 初始化已选择数据
const initSelectedItems = () => {
  setSelected(props.initData);
};

// 打开弹窗
const openDialog = () => {
  initSelectedItems();
  nextTick(() => {
    initChildComponents();
  });
};

// 选择或取消选择项目
const toggleSelectItem = (item) => {
  const index = indexOfItem(selectedItems, item);
  if (applySingleChoiceBehavior(index)) return;
  if (index === -1) {
    selectedItems.value.push(deepClone(item));
  } else {
    selectedItems.value.splice(index, 1);
  }
};

// 从已选择列表中移除项目
const removeSelectedItem = (item) => {
  const index = indexOfItem(selectedItems, item);
  if (index !== -1) {
    selectedItems.value.splice(index, 1);
  }
};

// 确认选择
const handleConfirm = () => {
  emit("confirm", selectedItems.value);
};

// 取消选择
const handleCancel = () => {
  emit("cancel");
};

// 处理部门点击事件
const handleDeptClick = (dept) => {
  clearSearchIfNeeded();
};

// 处理面包屑点击事件
const handleBreadcrumbClick = (DeptId) => {
  clearSearchIfNeeded();
};
// 组件挂载时初始化已选择数据
onMounted(() => {
  initSelectedItems();
});
// 对外暴露方法
defineExpose({ openDialog });
</script>

<template>
  <div class="te-deep">
    <!-- 主体内容 -->
    <div class="te-deep-content">
      <div class="te-deep-left-panel">
        <div class="te-deep-panel-title">请选择</div>
        <!-- 搜索框组件 -->
        <div class="te-deep-list-container">
          <search-bar ref="searchBarRef" :chooseType="chooseType" :disabled="isDisabled" :selected-items="selectedItems" :scope-node="scopeNode" :page-size="pageSize" :getDepListApi="getDepListApi" @select-item="toggleSelectItem">
            <template #search-results></template>
          </search-bar>
          <!-- 左侧组织架构 -->
          <department-list ref="departmentListRef" :chooseType="chooseType" :selectedItems="selectedItems" :getDepListApi="getDepListApi" :scope-node="scopeNode" :root-node-name="rootNodeName" :page-size="pageSize" @toggle-select="toggleSelectItem" @dept-click="handleDeptClick" @breadcrumb-click="handleBreadcrumbClick"> </department-list>
        </div>
      </div>

      <!-- 右侧已选择列表 -->
      <selected-list :chooseType="chooseType" :selectedItems="selectedItems" :disabled="isDisabled" @remove-item="removeSelectedItem"></selected-list>
    </div>

    <!-- 底部按钮 -->
    <div>
      <div class="te-deep-em-footer">
        <div @click="handleCancel" class="te-deep-button te-deep-button-cancel">取消</div>
        <div @click="handleConfirm" class="te-deep-button te-deep-button-enter">确定</div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import url("../iconfont/iconfont.css");
</style>
