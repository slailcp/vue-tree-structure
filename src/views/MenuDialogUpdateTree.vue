<script setup>
import { ref, onMounted, nextTick } from "vue";
import jsonData from "/src/api/department_modified.js";
import { getOperateData,deepclone } from "./utils";
import {treeMenu} from "vue-tree-structure";
import { QueryDeptsApi } from "/src/api/department.js";

const depShow = ref(false);

function getDepListApi(params) {
  return QueryDeptsApi({ ...params, pageSize: 15, getuser: 1 });
}

/**更新组织架构操作 */
const treeUpdateData = ref([]);

const onTreeDataUpdate = () => {
  treeUpdateData.value = getOperateData(1);
};
const onTreeDataAdd = () => {
  treeUpdateData.value = getOperateData(2);
};
const onTreeDataDel = () => {
  treeUpdateData.value = getOperateData(3);
};
</script>

<template>
  <div style="padding: 30px">
    <div style="padding-bottom: 10px">静态操作，实战项目中，这些数据需要由后端接口提供，数据格式参考getOperateData函数的返回值。</div>
    <el-button type="primary" @click="onTreeDataUpdate">更新" {{ (treeUpdateData.length && treeUpdateData[0].Name) || "" }}"的数据</el-button>
    <el-button type="primary" @click="onTreeDataAdd">"{{ (treeUpdateData.length && treeUpdateData[0].Name) || "" }}"新增部门</el-button>
    <el-button type="primary" @click="onTreeDataDel">" {{ (treeUpdateData.length && treeUpdateData[0].Name) || "" }}"删除新增的部门</el-button>
  </div>

  <div style="width: 1000px; height: 600px; overflow: auto; margin: 30px">
    <tree-menu :showLevel="2" :treeUpdateData="treeUpdateData" :getDepListApi="getDepListApi" style="height: 100%"></tree-menu>
  </div>
</template>

<style>
html,
body {
  background: #f5f7fa;
}
</style>
