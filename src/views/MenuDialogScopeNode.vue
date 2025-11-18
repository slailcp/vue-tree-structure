<script setup>
import { ref, onMounted, nextTick } from "vue";
import {treeMenu} from "vue-tree-structure";
import { QueryDeptsApi } from "/src/api/department.js";
import { getChooseOptions } from "./utils";

/**组件props字段 */
const scopeNode = ref(null);

const depShow = ref(false);
const PK_Guid = ref("");
/* 获取企业以及第一级不部门数据*/
const options = getChooseOptions().filter((item) => item.value.Level !== 2);

function getDepListApi(params) {
  return QueryDeptsApi({ ...params, pageSize: 15, getuser: 1 });
}

function onChange() {
  var node = options.find((item) => item.value.PK_Guid === PK_Guid.value);
  if (node) {
    scopeNode.value = { Name: node.value.Name, PK_Guid: node.value.PK_Guid };
  }
}

/**展开操作 */
</script>

<template>
  <el-form label-width="120px">
    <el-form-item label="scopeNode">
      <div>
        <el-button @click="scopeNode = null;PK_Guid=''" :type="!scopeNode ? 'primary' : ''">不选中任何项</el-button>
        此处演示，只展示企业下的第一级数据。
        <div style="width: 500px; margin-top: 20px">
          <el-radio-group v-model="PK_Guid">
            <el-radio v-for="(item, index) in options" :key="index" :label="`${item.label}`" style="width: 100%" :style="{ marginLeft: item.space * 10 + 'px' }" :value="item.value.PK_Guid" @change="onChange"></el-radio>
          </el-radio-group>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="depShow = true">选择部门/员工</el-button>
    </el-form-item>
  </el-form>

  <el-dialog v-model="depShow" :title="scopeNode?.Name || '全企业'" width="800px">
    <div style="height: 600px; overflow: auto">
      <tree-menu v-if="depShow" :scopeNode="scopeNode" :showLevel="2" :levelList="['100137','100139']" :getDepListApi="getDepListApi" style="height: 100%"></tree-menu>
    </div>
  </el-dialog>
</template>

<style>
html,
body {
  background: #f5f7fa;
}
</style>
