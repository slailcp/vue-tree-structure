<script setup>
import { ref, computed, watch } from "vue";
import { debounce } from "../utils/index.js";

// 定义组件属性
const props = defineProps({
  chooseType: {
    type: Number,
    default: 2,
  },

  // 是否禁用搜索
  disabled: {
    type: Boolean,
    default: false,
  },

  selectedItems: {
    type: Object,
    default: () => [],
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
  pageSize: {
    type: Number,
    default: 15,
  },
});

// 定义事件
const emit = defineEmits(["select-item"]);

// 搜索关键词
const searchKey = ref("");

const searchPopoverVisible = ref(false);
const searchResults = ref([]);

// 搜索相关的响应式变量
const searchLoading = ref(false);

// 处理搜索（原始函数，将被防抖包装）
const doSearch = async () => {
  if (!searchKey.value.trim()) {
    searchResults.value = [];
    searchPopoverVisible.value = false;
    return;
  }

  try {
    searchLoading.value = true;
    searchPopoverVisible.value = true;

    // 调用API获取搜索结果
    const result = await props.getDepListApi({
      PageIndex: 1,
      PageSize: props.pageSize,
      DeptId: (props.scopeNode || {}).PK_Guid, 
      DeptName: searchKey.value.trim(), 
    });

    // 根据选择类型过滤搜索结果
    let filteredResults = result.Data || [];
    //if (props.chooseType === 1) { // 只能选择部门
    //  filteredResults = filteredResults.filter(item => item.Level === 1);
    //} else if (props.chooseType === 2) { // 只能选择员工
    //  filteredResults = filteredResults.filter(item => item.Level === 2);
    //}
    searchResults.value = filteredResults;
  } catch (error) {
    ElMessage.error("搜索失败");
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
};

// 使用防抖包装搜索函数，300ms延迟
const handleSearch = debounce(doSearch, 300);

// 清空搜索
const clearSearch = () => {
  searchKey.value = "";
  searchPopoverVisible.value = false;
  searchResults.value = [];
};

// 选择或取消选择项目
const toggleSelectItem = (item) => {
  if (props.chooseType === 0) return;
  emit("select-item", item);
};

// 关闭搜索浮层
const closeSearchPopover = () => {
  searchPopoverVisible.value = false;
};

// 监听搜索关键词变化
watch(searchKey, (newVal) => {
  if (newVal === "") {
    searchPopoverVisible.value = false;
    searchResults.value = [];
  }
});
// 对外暴露方法
defineExpose({ clearSearch });
</script>

<template>
  <div class="te-search">
    <div class="te-deep-search-box">
      <span class="te-deep-search-icon">
        <i class="iconfont icon-a-sousuolunkuohua"></i>
      </span>
      <input type="text" class="te-deep-search-input" v-model.trim="searchKey" placeholder="姓名/手机号码/部门" @input="handleSearch" :disabled="disabled" />
      <span class="te-deep-search-close-icon" v-if="searchKey" @click="searchKey = ''">
        <i class="iconfont icon-a-guanbilunkuohua"></i>
      </span>
    </div>

    <!-- 搜索结果浮层的内容通过插槽由父组件提供 -->
    <slot name="search-results"></slot>

    <!-- 搜索结果浮层 -->
    <div class="te-search-search-popover" v-if="searchPopoverVisible">
      <div v-if="searchLoading" class="te-search-load-tree-node">
        <span class="te-deep-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..
      </div>
      <div class="te-search-search-result-list" v-else-if="searchResults.length > 0">
        <div v-for="item in searchResults" :key="item.PK_Guid" class="te-search-search-result-item">
          <!-- 部门项 -->
          <template v-if="item.Level === 1">
            <div class="te-search-dept-result-row">
              <span class="te-checkbox" v-if="chooseType === 1 || chooseType === 3" @click="toggleSelectItem(item)">
                <span class="iconfont icon-weixuanzhong1" v-if="!selectedItems.some((selected) => selected.PK_Guid === item.PK_Guid)"></span>
                <span class="iconfont icon-xuanzhong2" v-else></span>
              </span>

              <span class="te-search-dept-name" @click="toggleSelectItem(item)">{{ item.Name }}</span>
              <!--<span class="item-type">(部门)</span>-->
            </div>
          </template>

          <!-- 员工项 -->
          <template v-else-if="item.Level === 2">
            <div class="te-search-employee-result-row" @click="toggleSelectItem(item)">
              <span class="te-checkbox" v-if="chooseType === 2 || chooseType === 3" @click="toggleSelectItem(item)">
                <span class="iconfont icon-weixuanzhong1" v-if="!selectedItems.some((selected) => selected.PK_Guid === item.PK_Guid)"></span>
                <span class="iconfont icon-xuanzhong2" v-else></span>
              </span>

              <span class="te-search-employee-name" @click="toggleSelectItem(item)">{{ item.Name }}</span>
              <!--<span class="item-type">(员工)</span>-->
            </div>
          </template>
        </div>
      </div>
      <div v-else style="padding: 20px; text-align: center">
        没有搜索到<span class="col00a0e9">“{{ searchKey }}”</span>
      </div>
    </div>
    <div v-if="searchPopoverVisible" @click="closeSearchPopover()" class="te-search-search-popover-bg"></div>
  </div>
</template>

<style scoped lang="less"></style>
