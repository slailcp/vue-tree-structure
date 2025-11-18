<script setup>
import { ref, onMounted, watch, computed } from "vue";
import treeNode from "./TreeNode.vue";
import "./style.less";
// 定义组件属性
const props = defineProps({
  // 1:无checkbox模式单选，2:有checkbox模式单选， 3:有checkbox模式 多选
  mode: {
    type: Number,
    default: 1,
  },
  // 0:都不能选择 1:选择部门，2 可以选择员工，3 部门+员工都可以选择
  chooseType: {
    type: Number,
    default: 1,
  },

  // 初始选中数据
  initData: {
    type: Array,
    default: () => [],
  },
  // 更新目录数据，平铺
  treeUpdateData: {
    type: Array,
    default: () => [],
  },
  // 请求的函数
  getDepListApi: {
    type: Function,
    default: () => {},
  },
  // 只展示当前部门下的数据
  scopeNode: {
    type: Object,
    default: () => null,
  },
  pageSize: {
    type: Number,
    default: 15,
  },

  // 显示几级，0：只展示企业，1，展示企业+企业下面一级，2以此类推，默认展开第一个企业下的第一条数据，如果想要展开具体id数据，则需要配置levelList，需要按规则配置，
  showLevel: {
    type: Number,
    default: 0,
  },
  // 需要展开的部门id,["企业A-id','企业A的下一级部门B-id",部门B部门的下一级部门C-id",...],这里面的个数要和showLevel保持一致
  levelList: {
    type: Array,
    default: [],
  },
});

// 定义事件
const emit = defineEmits(["update:selected"]);

const LevelNodeIndex = ref(0);
// 搜索关键字
const searchKey = ref("");
// 搜索出来的数据
const searchData = ref(null);
const searchHasMore = ref(false);
const searchLoadingNodes = ref(false);
// 组织架构数据
const orgData = ref(null);
const orgHasMore = ref(false);
const orgLoadingNodes = ref(false);
// 企业信息
// const companyInfo = ref(null);
// 已展开的节点ID
const expandedNodes = ref(new Set());
// 已加载的节点数据缓存
const loadedNodesCache = ref({});
// 搜索结果-已展开的节点ID
const expandedNodesSerach = ref(new Set());
// 搜索结果-已加载的节点数据缓存
const loadedNodesCacheSerach = ref({});
// 选中的节点
const selectedNodes = ref([...props.initData]);
// 节点加载状态
const loadingNodes = ref(new Set());

// 初始化加载企业数据
onMounted(async () => {
  await loadCompanyData();
});

// 添加防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const isSearchMode = computed(() => !!searchKey.value.trim());
const apiFetch = (params) => props.getDepListApi(params);
const getExpandedSet = () => (isSearchMode.value ? expandedNodesSerach.value : expandedNodes.value);
const getLoadedCache = () => (isSearchMode.value ? loadedNodesCacheSerach.value : loadedNodesCache.value);

const loadList = async ({ dataRef, hasMoreRef, loadingRef, deptName }) => {
  const PageIndex = Math.floor((dataRef.value || []).length / props.pageSize) + 1;
  const response = await apiFetch({
    PageIndex,
    PageSize: props.pageSize,
    DeptId: (props.scopeNode || {}).PK_Guid || "",
    DeptName: deptName || "",
  });
  loadingRef && (loadingRef.value = false);
  if (response.Data && response.Data.length > 0) {
    dataRef.value = [...(dataRef.value || []), ...response.Data];
    hasMoreRef.value = response.HasMore;
  } else {
    dataRef.value = dataRef.value || [];
    hasMoreRef.value = false;
  }
  return response;
};

// 加载企业数据
const loadCompanyData = async () => {
  try {
    orgLoadingNodes.value = true;
    const response = await loadList({
      dataRef: orgData,
      hasMoreRef: orgHasMore,
      loadingRef: orgLoadingNodes,
      deptName: "",
    });
    const PageIndex = 1;
    if (props.showLevel > 0 && ((orgData.value || []).length <= props.pageSize)) {
      const newid = props.levelList[LevelNodeIndex.value];
      let newnode = (response.Data || []).find((f) => f.PK_Guid === newid);
      const nodeparams = newnode || (response.Data || [])[0] || {};
      if (nodeparams && (nodeparams.Level === 0 || nodeparams.Level === 1)) {
        toggleNode(nodeparams);
      } else {
        LevelNodeIndex.value = props.showLevel;
      }
    }
  } catch (error) {
    orgLoadingNodes.value = false;
    console.error("加载企业数据失败:", error);
  }
};

const loadMoreOrg = () => {
  orgLoadingNodes.value = true;
  loadCompanyData();
};

// 搜索部门
const searchDepartment = async () => {
  if (!searchKey.value.trim()) return;
  expandedNodesSerach.value.clear();
  loadedNodesCacheSerach.value = {};
  try {
    await loadList({
      dataRef: searchData,
      hasMoreRef: searchHasMore,
      loadingRef: searchLoadingNodes,
      deptName: searchKey.value,
    });
  } catch (error) {
    searchLoadingNodes.value = false;
    console.error("搜索部门失败:", error);
  }
};
const loadMoreSearch = () => {
  searchLoadingNodes.value = true;
  searchDepartment();
};

// 搜索防抖
const debouncedSearch = debounce(() => {
  searchData.value = null;
  searchDepartment();
}, 300);
const clearFn = () => {
  searchData.value = null;
  searchKey.value = "";
};

// 展开/收起节点
const toggleNode = async (node, event) => {
  event && event.stopPropagation();
  const nodeId = node.PK_Guid;
  const expanded = getExpandedSet();
  const cache = getLoadedCache();
  if (expanded.has(nodeId)) {
    expanded.delete(nodeId);
    return;
  }
  expanded.add(nodeId);
  if (!cache[nodeId]) {
    await loadChildNodes(node);
  }
};

// 加载子节点
const loadChildNodes = async (node) => {
  const nodeId = node.PK_Guid;
  if (loadingNodes.value.has(nodeId)) return;
  loadingNodes.value.add(nodeId);
  try {
    const response = await apiFetch({
      PageIndex: 1,
      PageSize: props.pageSize,
      DeptId: nodeId || (props.scopeNode || {}).PK_Guid || "",
      DeptName: "",
    });
    node.ChildNode = response.Data || [];
    const cache = getLoadedCache();
    cache[nodeId] = true;
    node.HasMore = response.HasMore;
    LevelNodeIndex.value++;
    if (!response.Data.length) {
      LevelNodeIndex.value = props.showLevel;
    }
    if (response.Data.length && LevelNodeIndex.value < props.showLevel) {
      const newid = props.levelList[LevelNodeIndex.value];
      let newnode = node.ChildNode.find((f) => f.PK_Guid === newid);
      const nodeparams = newnode || response.Data[0] || {};
      if (nodeparams.Level === 0 || nodeparams.Level === 1) {
        await toggleNode(nodeparams);
      } else {
        LevelNodeIndex.value = props.showLevel;
      }
    }
  } catch (error) {
    console.error("加载子节点失败:", error);
  } finally {
    loadingNodes.value.delete(nodeId);
  }
};

// 加载更多子节点
const loadMoreChildNodes = async (event, parentNode) => {
  const nodeId = parentNode.PK_Guid;

  if (loadingNodes.value.has(nodeId)) return;

  loadingNodes.value.add(nodeId);

  try {
    // 计算当前页码
    const currentChildCount = parentNode.ChildNode ? parentNode.ChildNode.length : 0;
    const PageIndex = Math.floor(currentChildCount / props.pageSize) + 1;

    const response = await apiFetch({
      PageIndex: PageIndex,
      PageSize: props.pageSize,
      DeptId: nodeId || (props.scopeNode || {}).PK_Guid || "",
      DeptName: "",
    });
    parentNode.HasMore = response.HasMore;
    if (response.Data && response.Data.length > 0) {
      // 追加新的子节点数据
      if (!parentNode.ChildNode) {
        parentNode.ChildNode = [];
      }
      parentNode.ChildNode = [...parentNode.ChildNode, ...response.Data];
    }
  } catch (error) {
    console.error("加载更多子节点失败:", error);
  } finally {
    loadingNodes.value.delete(nodeId);
  }
};

// 确认选择
const toggleSelectItem = (node) => {
  const index = selectedNodes.value.findIndex((selected) => selected.PK_Guid === node.PK_Guid);

  if (props.mode !== 3) {
    if (index !== -1) {
      selectedNodes.value = [];
      return;
    } else {
      selectedNodes.value = [];
    }
  }

  if (index === -1) {
    // 添加到已选择列表
    selectedNodes.value.push(JSON.parse(JSON.stringify(node)));
  } else {
    // 从已选择列表中移除
    selectedNodes.value.splice(index, 1);
  }

  emit("update:selected", selectedNodes.value && selectedNodes.value.length ? selectedNodes.value : null);
};



// 监听初始数据变化
watch(
  () => props.initData,
  (newVal) => {
    selectedNodes.value = [...newVal];
  },
  { deep: true }
);

// 对外暴露方法
defineExpose({});
</script>

<template>
  <div>
    <div class="te-tree">
      <!-- 搜索框 -->
      <div class="te-tree-search-box">
        <span class="te-tree-search-icon">
          <i class="iconfont icon-a-sousuolunkuohua"></i>
        </span>
        <input type="text" class="te-tree-search-input" v-model.trim="searchKey" placeholder="搜索部门" @input="debouncedSearch" />
        <span class="te-tree-search-close-icon" v-if="searchKey" @click="clearFn">
          <i class="iconfont icon-a-guanbilunkuohua"></i>
        </span>
      </div>

      <!-- 组织架构树 -->
      <div class="te-tree-list">
        <div v-show="searchKey">
          <div v-if="!searchData" class="te-tree-empty-data">
            <span class="te-tree-loading-node"
              ><span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..</span
            >
          </div>
          <div v-else-if="searchData.length === 0" class="te-tree-empty-data">
            没有查询到<span class="col00a0e9">“{{ searchKey }}”</span>
          </div>
          <div v-else>
            <tree-node v-for="node in searchData" :key="node.PK_Guid" :propnode="node" :mode="mode" :chooseType="chooseType" :expanded-nodes="expandedNodesSerach" :tree-update-data="treeUpdateData" :loading-nodes="loadingNodes" :selected-nodes="selectedNodes" :page-size="pageSize" :search-key="searchKey" @toggle-node="toggleNode" @load-more-nodes="loadMoreChildNodes" @update:selected="toggleSelectItem">
              <template #nodename="scope">
                <slot name="nodename" v-bind="scope"></slot>
              </template>
              <template #append="scope">
                <slot name="append" v-bind="scope"></slot>
              </template>
            </tree-node>

            <div class="te-tree-load-more" v-if="searchLoadingNodes">
              <span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span>
              正在加载,请稍后..
            </div>
            <div v-else-if="searchHasMore" @click="loadMoreSearch" class="te-tree-load-more">加载更多<i class="iconfont icon-a-xiangxialunkuohua"></i></div>
          </div>
        </div>
        <div v-show="!searchKey">
          <div v-if="orgData === null" class="te-tree-empty-data">
            <span class="te-tree-loading-node"
              ><span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..</span
            >
          </div>
          <div v-else-if="orgData.length === 0" class="te-tree-empty-data">
            <span class="te-tree-loading-node">暂无数据</span>
          </div>

          <template v-else-if="LevelNodeIndex >= showLevel">
            <tree-node v-for="node in orgData" :key="node.PK_Guid" :propnode="node" :mode="mode" :chooseType="chooseType" :expanded-nodes="expandedNodes" :tree-update-data="treeUpdateData" :loading-nodes="loadingNodes" :selected-nodes="selectedNodes" :page-size="pageSize" :search-key="searchKey" @toggle-node="toggleNode" @load-more-nodes="loadMoreChildNodes" @update:selected="toggleSelectItem">
              <template #nodename="scope">
                <slot name="nodename" v-bind="scope"></slot>
              </template>
              <template #append="scope">
                <slot name="append" v-bind="scope"></slot>
              </template>
            </tree-node>
            <div class="te-tree-load-more" v-if="orgLoadingNodes">
              <span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span>
              正在加载,请稍后..
            </div>
            <div v-else-if="orgHasMore" @click="loadMoreOrg" class="te-tree-load-more">加载更多<i class="iconfont icon-a-xiangxialunkuohua"></i></div>
          </template>
          <div v-else class="te-tree-empty-data">
            <span class="te-tree-loading-node"
              ><span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import url("../iconfont/iconfont.css");
</style>
