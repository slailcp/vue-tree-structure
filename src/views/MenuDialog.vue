<script setup>
import { jsonData } from "/src/api/department_modified.js";
import { ref, onMounted, nextTick } from "vue";

import { deepclone } from "./utils";
import {treeMenu} from "vue-tree-structure";
import { QueryDeptsApi } from "/src/api/department.js";



/**组件props字段 */
const mode = ref(1);
const showLevel = ref(1);
const chooseType = ref(3);
const pageSize = ref(3);
const depShow = ref(false);

/*选择的数据*/
let selectNode = ref(null);

function selectionDepFn(node) {
  if (node) selectNode.value = node;
  console.log(selectNode.value);
}

function getDepListApi(params) {
  return QueryDeptsApi({ ...params, pageSize: 15, getuser: 1 });
}

/**展开操作 */
</script>

<template>
  <el-form label-width="120px">
    <el-form-item label="chooseType">
      <el-radio-group v-model="chooseType">
        <el-radio :value="0">查看组织架构0</el-radio>
        <el-radio :value="1">选择部门1</el-radio>
        <el-radio :value="2">选择员工2</el-radio>
        <el-radio :label="3">选择员工+部门3</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="mode" v-if="chooseType != 0">
      <el-radio-group v-model="mode">
        <el-radio :value="1">无复选框单选</el-radio>
        <el-radio :value="2">复选框单选</el-radio>
        <el-radio :label="3">复选框多选</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="pageSize">
      <el-select v-model="pageSize" placeholder="" style="width: 240px">
        <el-option v-for="(item, index) in [2, 3, 5, 10, 15, 20, 30, 50, 100]" :key="item" :label="`每页加载${item}条`" :value="item"></el-option>
      </el-select>
    </el-form-item>
  
    <el-form-item label="showLevel">
      <el-select v-model="showLevel" placeholder="" style="width: 240px">
        <el-option v-for="(item, index) in 15" :key="item" :label="`展开${index}级`" :value="index"></el-option>
      </el-select>
      <span style="color: #999; padding-left: 20px">showLevel超过了最大层技数，取最大层级</span>
      <router-link to="/MenuDialogShowLevel" style="padding-left: 20px"><el-button type="primary" size="small">自定义层级</el-button></router-link>
    </el-form-item>
    <el-form-item label="initData">
      <router-link to="/MenuDialogInitData"><el-button type="primary" size="small">设置初始选中数据</el-button></router-link>
    </el-form-item>
    <el-form-item label="scopeNode">
      <router-link to="/MenuDialogScopeNode"><el-button type="primary" size="small">加载其中一个部门下的组织架构</el-button></router-link>
    </el-form-item>
    <el-form-item label="treeUpdateData">
      <router-link to="/MenuDialogUpdateTree"><el-button type="primary" size="small">更新组织架构</el-button></router-link>
    </el-form-item>

    <el-form-item>
      <el-button
        @click="
          depShow = true;
          selectNode = [];
        "
        >选择部门/员工</el-button
      >
    </el-form-item>
  </el-form>

  <el-dialog v-model="depShow" title="选择部门/员工" width="800px">
    <div style="height: 600px; overflow: auto">
      <tree-menu v-if="depShow" :mode="mode" :showLevel="showLevel" :pageSize="pageSize" :chooseType="chooseType" :getDepListApi="getDepListApi" v-on:update:selected="selectionDepFn" style="height: 100%"></tree-menu>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          @click="
            depShow = false;
            selectNode = null;
          "
          >取消</el-button
        >
        <el-button type="primary" v-on:click="selectionDepFn()">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
html,
body {
  background: #f5f7fa;
}
</style>
