<script setup>
import { ref, onMounted, nextTick, reactive } from "vue";
import { ElMessageBox } from "element-plus";
import {treeMenu} from "vue-tree-structure";
import { QueryDeptsApi, editDeptApi, addDeptApi, delDeptApi } from "/src/api/department.js";

const initData = ref([{ PK_Guid: "100007", Name: "法务部", Level: 1 }]);
const treeUpdateData = ref(null);
const editShow = ref(false);
const addParams = reactive({
  childDepName: "",
  Name: "",
  PK_Guid: "",
});
const editParams = reactive({
  Name: "",
  PK_Guid: "",
});
// selected
function handleSelectionChange(node) {
  console.log(node);
}

function handleEditDepartment(node, type) {
  if (type == 1) {
    // 新增
    addParams.Name = node.Name;
    addParams.PK_Guid = node.PK_Guid;
    editParams.Name = "";
    editParams.PK_Guid = "";
  }
  if (type == 2) {
    // 编辑
    editParams.Name = node.Name;
    editParams.PK_Guid = node.PK_Guid;
    addParams.childDepName = "";
    addParams.PK_Guid = "";
  }
  editShow.value = true;
}

function handleDeleteChildDepartment(node) {
  ElMessageBox.confirm(`确认要删除“${node.Name}”吗？`, {
    title: "提示",
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
  }).then((data) => {
    delDeptApi({
      DeptId: node.PK_Guid,
    }).then((ret) => {
      debugger;
      treeUpdateData.value = ret.Data;
    });
  });
}
// 更新目录数据
function updateDataFn() {
  // 新增接口返回的数据结构 （ChildNode字段下的数据为新增的数据）
  // treeUpdateData.value = [
  //   {
  //     PK_Guid: "100001", Name: "部门6", Level: 1, UserCount: 22,
  //     ChildNode: [{ PK_Guid: "10000a2", Name: "新增部门", Level: 1, UserCount: 0 }],
  //   },
  //   { PK_Guid: "100000", Name: "测试企业A", Level: 0, UserCount: 9, },
  // ];
  // 删除接口返回的数据结构 （新增delIdList字段）
  // treeUpdateData.value = [
  //   {
  //     PK_Guid: "100001", Name: "部门6", Level: 1, UserCount: 22, ChildNode: null,
  //     DelIdList:[],
  //   },
  //   { PK_Guid: "100000", Name: "测试企业A", Level: 0, UserCount: 9, },
  // ];
}

function editEnter() {
  if (addParams.PK_Guid) {
    /**新增接口返回的是平铺的数据，从当前部门（ChildNode下包含一条新增的数据）->父部门->爷爷部门 */
    addDeptApi({
      DeptId: addParams.PK_Guid,
      childDepName: addParams.childDepName,
    }).then((ret) => {
      editShow.value = false;
      treeUpdateData.value = ret.Data;
      console.log(ret);
    });
  } else {
    /**编辑接口返回的是平铺的数据，从当前部门->父部门->爷爷部门 */
    editDeptApi({
      DeptId: editParams.PK_Guid,
      Name: editParams.Name,
    }).then((ret) => {
      editShow.value = false;
      treeUpdateData.value = ret.Data;
    });
  }
}

onMounted(() => {});
</script>

<template>
  <div style="width: 700px; margin: 0 auto">
    <div>
      <div>
        部门菜单（不展示员工）
      </div>
    
      <tree-menu :mode="1" :show-level="1" :initData="initData" :page-size="3" :tree-update-data="treeUpdateData" :getDepListApi="QueryDeptsApi" v-on:update:selected="handleSelectionChange" style="height: calc(100vh - 130px)">
        <!-- <template #nodename="{ node }">
          <el-popover class="box-item" :content="node.Name" placement="top" popper-style="width: auto;">
            <template #reference>{{ node.Name }} </template>
          </el-popover>
        </template> -->
        <template #append="{ node }">
          <span class="node-operate" style="position: absolute; right: 10px">
            <el-popover class="box-item" placement="bottom" popper-class="operate-popper">
              <div class="operate-list">
                <div class="o-item" @click="handleEditDepartment(node, 2)" v-if="node.Level !== 0">编辑部门</div>
                <div class="o-item" @click="handleEditDepartment(node, 1)">添加子部门</div>
                <div class="o-item" @click="handleDeleteChildDepartment(node)" style="color: #f93d3d" v-if="node.Level !== 0">删除部门</div>
              </div>
              <template #reference> ...</template>
            </el-popover>
          </span>
        </template>
      </tree-menu>
    </div>
  </div>

  <!--编辑部门-->
  <el-dialog v-model="editShow" :title="`${addParams.PK_Guid ? '新增' : '编辑'}部门`" width="600px">
    <el-form :model="editParams" label-width="auto">
      <el-form-item label="父部门" v-if="addParams.Name">
        {{ addParams.Name }}
      </el-form-item>
      <el-form-item label="部门名称">
        <el-input v-model="addParams.childDepName" v-if="addParams.PK_Guid" />
        <el-input v-model="editParams.Name" v-else />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="editShow = false">取消</el-button>
      <el-button type="primary" @click="editEnter">确定</el-button>
    </template>
  </el-dialog>
</template>

<style>
html,
body {
  background: #f5f7fa;
}
</style>
