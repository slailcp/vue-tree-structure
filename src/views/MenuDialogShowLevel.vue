<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getLevelNode } from "./utils";
import jsonData from "/src/api/department_modified.js";

import {treeMenu} from "/packages";
// import {treeMenu} from "vue-tree-structure";
import { QueryDeptsApi } from "/src/api/department.js";

const depShow = ref(false);

function getDepListApi(params) {
  return QueryDeptsApi({ ...params, pageSize: 15, getuser: 1 });
}

const showLevel = ref(0);
const levelListNode = ref([]);
const levelList = ref([]);
const levelListName = ref([]);
const isShowLevel = ref(false);

const onRandomNodeList = () => {
  if (isShowLevel.value) {
    levelListNode.value = getLevelNode();
    showLevel.value = levelListNode.value.length;
  }
};

onMounted(() => {
  onRandomNodeList();
});
</script>

<template>
  <el-form label-width="120px">
 
    <el-form-item label="showLevel">
      <el-select v-model="showLevel" placeholder="" style="width: 240px">
        <el-option v-for="(item, index) in 17" :key="index" :label="`展开${ index }层`" :value="index"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="levelList">
      <div>
        <el-checkbox v-model="isShowLevel" @change="onRandomNodeList()">自定义固定层级</el-checkbox><br />
        <div v-if="isShowLevel">
          {{ levelListNode.map((f) => f.Name).join("=>") }}<br />
          <el-button @click="onRandomNodeList">随机生成展开目录的id</el-button>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="depShow = true">打开组织架构</el-button>
    </el-form-item>
  </el-form>

  <el-dialog v-model="depShow" title="选择部门/员工" width="800px">
    <div style="height: 600px; overflow: auto">
      <tree-menu v-if="depShow" :showLevel="showLevel" :levelList="isShowLevel ? levelListNode.map((f) => f.PK_Guid) : []" :getDepListApi="getDepListApi" style="height: 100%"></tree-menu>
    </div>
  </el-dialog>
</template>

<style>
html,
body {
  background: #f5f7fa;
}
</style>
