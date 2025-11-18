<script setup>
import { ref, watch } from "vue";

// 定义组件属性
const props = defineProps({
  // 1:无checkbox模式单选，2:有checkbox模式单选， 3:有checkbox模式 多选
  mode: {
    type: Number,
    default: 1,
  },
  // 1:选择部门，2 可以选择员工，3 部门+员工都可以选择
  chooseType: {
    type: Number,
    default: 1,
  },
  propnode: {
    type: Object,
    required: true,
  },
  expandedNodes: {
    type: Object,
    required: true,
  },
  loadingNodes: {
    type: Object,
    required: true,
  },

  selectedNodes: {
    type: Array,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },

  searchKey: {
    type: String,
    default: "",
  },
  depth: {
    type: Number,
    default: 0,
  },

  // 更新目录数据，平铺
  treeUpdateData: {
    type: Array,
    default: () => [],
  },
});

// 定义事件
const emit = defineEmits(["toggle-node", "load-more-nodes",  "update:selected"]);
const node = ref({ ...props.propnode });
// 判断节点是否已选中
const isNodeSelected = (node) => {
  return props.selectedNodes.some((item) => item.PK_Guid === node.PK_Guid);
};

// 判断节点是否可以展开(有子节点)
const canExpand = (node) => {
  // 搜索模式下不允许展开
  // if (props.searchKey.trim()) return false;
  // 有子节点或者未加载过的部门节点可以展开
  return (node.ChildNode && node.ChildNode.length > 0) || node.Level <= 1;
};

// 选择节点
const toggleNode = (node, e) => {
  if ((props.chooseType == 1 && node.Level !== 2) || (props.chooseType == 2 && node.Level === 2) || props.chooseType == 3) {
    // 通知父组件选中数据变化
    emit("update:selected", node);
  }
};

// 处理节点展开/收起
const handleToggleNode = (node, event) => {
  emit("toggle-node", node, event);
};

// 处理加载更多
const handleLoadMore = (event, node) => {
  emit("load-more-nodes", event, node);
};

// 监听初始数据变化
watch(
  () => props.treeUpdateData,
  (val) => {
    const curnode = props.treeUpdateData.find((item) => item.PK_Guid === node.value.PK_Guid) || {};
    const newnode = { ...node.value, ...curnode };

    newnode.ChildNode = node.value.ChildNode;
    if (!newnode.ChildNode) {
      newnode.ChildNode = [];
    }
    if (node.value.DelIdList && (!curnode.DelIdList || !curnode.DelIdList.length)) {
      delete newnode.DelIdList;
    }

    /* 数据说明--新增接口getParentsApi 调用新接口获取当前部门(员工)+所有父部门，按从内到外依次平铺的数据赋值给props.treeUpdateData，在props.treeUpdateData里面查找 正在操作的当前部门(员工)+所有父部门，查到了就用treeUpdateData里面查找里面的数据覆盖(除了ChildNode)，数据结构 {parent:[node1,node2,node3], newParent:[node1,node2,node3]}
     * 当前部门(员工)的父部门没有更改 取parent中的数据
     ** 编辑-编辑部门(员工)成功的时候,传参(当前部门(员工)id)，后端识别到当前部门(员工)的父部门没有更改,则返回当前部门(员工)+所有父部门
     ** 新增-当前部门新增子部门(员工)成功的时候，传参(当前部门id,新增成功的子部门(员工)id)，后端返回当前部门+所有父部门，当前部门下ChildNode包含新增的子部门(员工)
     ** 删除-删除当前部门(员工)的时候，传参(当前部门(员工)id)，后端返回所有父部门,后端会识别到当前部门(员工)不存在于父部门中，则在当前直接父部门delIdList字段里面添加删除的PK_Guid，
     * 当前部门(员工)的父部门被更改(移动了部门)
     ** 移动-移动部门(员工)，传参(当前部门(员工)id)，老部门(员工)按照删除的流程，新部门(员工)按照新增的流程{parent:旧父部门,newParent:新父部门} ，依次赋值给treeUpdateData，然后节点进行更新
     */
    // 删除
    if (newnode.DelIdList && newnode.DelIdList.length) {
      newnode.ChildNode = newnode.ChildNode.filter((item) => newnode.DelIdList.indexOf(item.PK_Guid) === -1);
      if (!(newnode.ChildNode || []).length) {
        handleLoadMore({}, newnode);
      }
    } else if (curnode.ChildNode && curnode.ChildNode.length) {
      curnode.ChildNode.forEach((item) => {
        const idlist = newnode.ChildNode.map((f) => f.PK_Guid);
        const i = idlist.indexOf(item.PK_Guid);
        if (i !== -1) {
          // 编辑
          newnode.ChildNode[i] = {
            ...item,
            ChildNode: newnode.ChildNode[i].ChildNode || null,
          };
        } else {
          //新增
          newnode.ChildNode.unshift(item);
        }
      });
    }
    // 新加
    if (!(node.value.ChildNode || []).length) {
      newnode.ChildNode = null;
    }
    node.value = newnode;
  },
  { deep: true }
);

// 对外暴露方法
defineExpose({});
</script>

<template>
  <div class="te-tree-node">
    <div class="te-tree-node-content" :class="{ 'te-selected': isNodeSelected(node) }" @click="toggleNode(node)">
      <!-- 展开/收起图标 -->
      <span v-if="canExpand(node)" class="te-tree-expand-icon" @click.stop="handleToggleNode(node, $event)">
        <i v-if="expandedNodes.has(node.PK_Guid)" class="iconfont icon-a-xiangxialunkuohua"></i>
        <i v-else class="iconfont icon-a-xiangyoulunkuohua"></i>
      </span>
      <span v-else class="te-tree-expand-placeholder"></span>
      <span class="te-checkbox" v-if="mode !== 1 && ((chooseType == 1 && node.Level !== 2) || (chooseType == 2 && node.Level === 2) || chooseType == 3)">
        <span class="iconfont icon-weixuanzhong1" v-if="!isNodeSelected(node)"></span>
        <span class="iconfont icon-xuanzhong2" v-else></span>
      </span>
      <slot name="nodename" :node="node">
        <!-- 节点图标 -->
        <span class="te-tree-node-icon">
          <span class="iconfont icon-bumen" v-if="node.Level !== 2"></span>
          <span class="iconfont icon-yuangong" v-else></span>
        </span>
        <!-- 节点名称 -->
        <span class="te-tree-node-name" :title="`${node.Name} (${node.UserCount || 0})`"
          >{{ node.Name }}
          <span v-if="node.Level !== 2">({{ node.UserCount || 0 }})</span>
        </span>
        <span class="te-tree-iconchecked" v-show="isNodeSelected(node)"></span>
      </slot>
      <slot name="append" :node="node"></slot>
    </div>

    <!-- 子节点 防止切换箭头重新渲染卡顿，此处保持v-show,不可使用v-if-->
    <div v-show="expandedNodes.has(node.PK_Guid)" class="te-tree-child-nodes" :class="{ nodeconpamy: node.Level === 0 }">
      <template v-if="node.ChildNode && node.ChildNode.length > 0">
        <!-- 递归渲染子节点 -->
        <tree-node v-for="childNode in node.ChildNode" :key="childNode.PK_Guid" :propnode="childNode" :mode="mode" :chooseType="chooseType" :expanded-nodes="expandedNodes" :tree-update-data="treeUpdateData" :loading-nodes="loadingNodes" :selected-nodes="selectedNodes" :page-size="pageSize" :search-key="searchKey" :depth="depth + 1" @toggle-node="handleToggleNode" @load-more-nodes="handleLoadMore" @update:selected="toggleNode">
          <template #nodename="scope">
            <slot name="nodename" v-bind="scope"></slot>
          </template>
          <template #append="scope">
            <slot name="append" v-bind="scope"></slot>
          </template>
        </tree-node>

        <!-- 加载更多按钮 -->
        <div v-if="node.HasMore" class="te-tree-load-more">
          <span v-if="loadingNodes.has(node.PK_Guid)"
            ><span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..</span
          >
          <div v-else @click="handleLoadMore($event, node)">加载部门 <i class="iconfont icon-a-xiangxialunkuohua"></i></div>
        </div>
      </template>

      <div v-else-if="loadingNodes.has(node.PK_Guid)" class="te-tree-loading-node">
        <span
          ><span class="te-tree-animation-loading"><i class="iconfont icon-loading"></i></span> 正在加载,请稍后..</span
        >
      </div>

      <div v-else class="te-tree-empty-node">
        <span>已无下级部门</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
