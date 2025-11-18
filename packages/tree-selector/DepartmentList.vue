<script setup>
import { ref, computed } from "vue";
import { UseBreadcrum } from "../utils/breadcrum.js";
import "../variables.less";
// 定义组件属性
const props = defineProps({
  // 选择类型：0-都不可选择，只能查看，1-只能选择部门，2-只能选择员工，3-员工部门都可以选择
  chooseType: {
    type: Number,
    default: 2,
  },
  // 已选择的数据
  selectedItems: {
    type: Array,
    required: true,
  },
  scopeNode: {
    type: Object,
    default: () => null,
  },
  // 请求的函数
  getDepListApi: {
    type: Function,
    default: () => {},
  },
  // 根面包屑名称()
  rootNodeName: {
    type: String,
    default: "",
  },
  pageSize: {
    type: Number,
    default: 15,
  },
});

// 定义事件
const emit = defineEmits(["toggle-select", "dept-click", "breadcrumb-click"]);

const useBreadcrum = UseBreadcrum();

// 当前部门ID
const currentDeptId = ref(null);
// 当前部门
const currentDept = ref(null);

// 分页参数
const pagination = ref({
  PageIndex: 1,
  PageSize: props.pageSize,
  HasMore: true,
});

// 组织架构数据
const deptList = ref([]);

// 加载状态
const loading = ref(false);

// 面包屑导航数据
const breadcrumb = ref([]);

// 计算属性：根据propstype判断是否可以选择部门
const canSelectDept = computed(() => props.chooseType === 1 || props.chooseType === 3);

// 计算属性：根据propstype判断是否可以选择员工
const canSelectEmployee = computed(() => props.chooseType === 2 || props.chooseType === 3);

// 加载部门数据
const loadDeptData = async () => {
  try {
    loading.value = true;

    // 调用API获取部门和用户列表
    const result = await props.getDepListApi({
      PageIndex: pagination.value.PageIndex,
      PageSize: pagination.value.PageSize,
      DeptId: currentDept.value ? currentDept.value.PK_Guid : (props.scopeNode || {}).PK_Guid,
    });

    const { Data, HasMore } = result;
    pagination.value.HasMore = HasMore;

    // 更新数据列表
    if (pagination.value.PageIndex === 1) {
      deptList.value = Data;
    } else {
      deptList.value = [...deptList.value, ...Data];
    }
    let companyItem = null;
    if ((Data || []).length && Data[0].Level === 0) {
      companyItem = Data[0];
    }

    const rootname = { Name: props.rootNodeName, PK_Guid: null, Level: 0 }; //props.rootNodeName?{Name:props.rootNodeName,PK_Guid:null, Level:0 } : companyItem

    // 更新面包屑导航
    const BreadcrumbData = useBreadcrum.getDepartmentPath(currentDept.value || props.scopeNode || null, rootname);
    if (BreadcrumbData) {
      breadcrumb.value = BreadcrumbData;
    }

    // 更新是否有更多数据
    // pagination.value.HasMore = data.length === pagination.value.PageSize;
  } catch (error) {
    console.error("加载部门数据失败:", error);
    alert("加载部门数据失败");
  } finally {
    loading.value = false;
  }
};

// 加载更多数据
const loadMore = () => {
  pagination.value.PageIndex++;
  loadDeptData();
};

// 点击部门，加载子部门
const handleDeptClick = (dept) => {
  currentDeptId.value = dept.PK_Guid;
  currentDept.value = dept;
  pagination.value.PageIndex = 1;
  // pagination.value.HasMore = true;
  deptList.value = [];
  loadDeptData();

  // 通知父组件部门点击事件
  emit("dept-click", dept);
};

// 判断项目是否已选中
const isItemSelected = (item) => {
  return props.selectedItems.some((selected) => selected.PK_Guid === item.PK_Guid);
};

// 选择或取消选择项目
const toggleSelectItem = (item) => {
  if (canSelectDept.value || canSelectEmployee.value) emit("toggle-select", item);
};

// 处理面包屑点击
const handleBreadcrumbClick = (dept, index) => {
  if (breadcrumb.value.length - 1 === index) return;
  //if (breadcrumb.value.length - 1 === index && dept.Level !== 0 && (!dept.ChildNode || !dept.ChildNode.length)) {
  //    return
  //}

  currentDeptId.value = dept ? dept.PK_Guid : null;
  currentDept.value = dept || null;
  pagination.value.PageIndex = 1;
  //pagination.value.HasMore = true;
  deptList.value = [];
  loadDeptData();

  // 通知父组件面包屑点击事件
  emit("breadcrumb-click", currentDeptId.value);
};

// 初始化加载数据
const initLoad = () => {
  deptList.value = [];
  currentDeptId.value = null;
  currentDept.value = null;
  pagination.value.PageIndex = 1;
  breadcrumb.value = [];
  useBreadcrum.clearDepartmentPathCache();
  loadDeptData();
};

// 对外暴露方法
defineExpose({ initLoad, loadDeptData });
</script>

<template>
  <div class="te-deep-dep-list">
    <!-- 面包屑导航 -->
    <div class="te-deep-breadcrumb-nav" v-if="breadcrumb.length > 0">
      <span class="te-deep-navitem" :class="{ col00a0e9: index !== breadcrumb.length - 1 }" v-for="(item, index) in breadcrumb" :key="index" @click="handleBreadcrumbClick(item, index)"> {{ item.Name }}<span v-if="index !== breadcrumb.length - 1"> > </span> </span>
    </div>

    <div class="te-deep-load-tree-node" v-if="loading && deptList.length === 0">
      <span class="te-deep-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..
    </div>

    <div v-else-if="deptList.length === 0" class="te-deep-empty-tip">暂无数据</div>

    <div v-else class="te-deep-deplistcon">
      <div v-for="item in deptList" :key="item.PK_Guid" class="te-deep-dept-item">
        <!-- 部门项 -->
        <template v-if="item.Level === 0 || item.Level === 1">
          <div class="te-deep-dept-row">
            <!-- 展开箭头 -->
            <i class="iconfont icon-a-xiangyoulunkuohua expand-icon" @click="handleDeptClick(item)"></i>

            <!-- 选择框 -->

            <span class="te-checkbox" v-if="canSelectDept" @click="toggleSelectItem(item)">
              <span class="iconfont icon-weixuanzhong1" v-if="!isItemSelected(item)"></span>
              <span class="iconfont icon-xuanzhong2" v-else></span>
            </span>

            <!-- 部门名称 -->

            <span class="te-deep-dept-name" @click="canSelectDept ? toggleSelectItem(item) : handleDeptClick(item)">
              <i class="iconfont icon-bumen" v-if="item.Level === 0"></i>
              <i class="iconfont icon-bumen2" v-if="item.Level === 1"></i>
              {{ item.Name }}</span
            >
          </div>
        </template>

        <!-- 员工项 -->
        <template v-else-if="item.Level === 2">
          <div class="te-deep-employee-row">
            <!-- 占位图标 -->
            <span class="te-deep-placeholder-icon"></span>

            <!-- 选择框 -->
            <span class="te-checkbox" v-if="canSelectEmployee" @click="toggleSelectItem(item)">
              <span class="iconfont icon-weixuanzhong1" v-if="!isItemSelected(item)"></span>
              <span class="iconfont icon-xuanzhong2" v-else></span>
            </span>
            <!-- 员工名称 -->

            <span class="te-deep-employee-name" @click="toggleSelectItem(item)"> <i class="iconfont icon-yuangong"></i>{{ item.Name }}</span>
          </div>
        </template>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="pagination.HasMore" class="te-deep-load-more">
        <template v-if="loading">
          <span class="te-deep-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..
        </template>
        <div v-else @click="loadMore">查看更多 <i class="iconfont icon-a-xiangxialunkuohua"></i></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
