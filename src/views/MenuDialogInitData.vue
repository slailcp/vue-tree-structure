<script setup>
import { ref, onMounted, nextTick } from "vue";
import {treeMenu} from "vue-tree-structure";
import { QueryDeptsApi } from "/src/api/department.js";
import { getChooseOptions } from "./utils";

/**组件props字段 */
const initData = ref([]);
const depShow = ref(false);

/*选择的数据*/
let selectNode = ref(null);

/* 获取企业以及第一级不部门数据*/
const options = getChooseOptions();

function selectionDepFn(node) {
  selectNode.value = node;
}
function enterDepFn() {
  initData.value = selectNode.value.map((item) => ({ PK_Guid: item.PK_Guid }));
  depShow.value = false;
}

function getDepListApi(params) {
  return QueryDeptsApi({ ...params, pageSize: 15, getuser: 1 });
}

/**展开操作 */
</script>

<template>
  <el-form label-width="120px">
    <el-form-item label="initData">
      <div>
        <el-button @click="initData = []" :type="!initData.length ? 'primary' : ''">不选中任何项</el-button>
        <div style="width: 1000px; margin-top: 20px">
          此处演示，只展示企业下的第一级数据。
          <el-checkbox-group v-model="initData" style="width: 240px">
            <el-checkbox v-for="(item, index) in options" :key="index" :label="`${item.label}`" style="width: 100%" :style="{ marginLeft: item.space * 10 + 'px' }" :value="{ PK_Guid: item.value.PK_Guid }"></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="
          depShow = true;
          selectNode = null;
        "
        >选择部门/员工</el-button
      >
    </el-form-item>
  </el-form>

  <el-dialog v-model="depShow" title="选择部门/员工" width="800px">
    <div style="height: 600px; overflow: auto">
      <tree-menu v-if="depShow" :mode="3" :pageSize="50" :chooseType="3" :showLevel="1" :initData="initData" :getDepListApi="getDepListApi" v-on:update:selected="selectionDepFn" style="height: 100%"></tree-menu>
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
        <el-button type="primary" v-on:click="enterDepFn">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
html,
body {
  background: #f5f7fa;
}

:deep(.te-tree-node-content.te-selected) {
  background-color: transparent !important;
  color: var(--te-node-selected-bg-color);
  border-left: none;
  box-shadow: none;
}
</style>
