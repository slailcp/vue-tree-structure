// 部门相关API服务
import { jsonData } from './department_modified.js';
import { flattenTree, getDirectChildrenAndClear, filterLevel2Nodes, updateNodeName, deepclone, findNodeAndParents, insertToChildNode, deleteNodeById } from './utils.js'




/**DeptId, DelIdList*/
export function delDeptApi(params) {
  console.log('params:'+JSON.stringify(params))
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const nodePath = deepclone(findNodeAndParents(jsonData.Data, params.DeptId) || [])
      deleteNodeById(jsonData.Data, params.DeptId)
      nodePath.forEach((item) => {
        item.ChildNode = null
      })
      if (nodePath.length) {
        nodePath.splice(0, 1)
        nodePath[0].DelIdList = [params.DeptId]
      }
      const ret = {
        ResultCode: 200,
        Data: nodePath
      }
      resolve(ret)
    }, 500)
  })
}
/**DeptId, childDepName*/
export function addDeptApi(params) {
  console.log('params:'+JSON.stringify(params))
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      var childData = {
        "PK_Guid": `${params.DeptId}${Math.random()}`,
        "Name": params.childDepName,
        "Level": 1,
        "ChildNode": null,
      }
      insertToChildNode(jsonData.Data, params.DeptId, childData)
      const nodePath = deepclone(findNodeAndParents(jsonData.Data, params.DeptId) || [])
      // 新增
      nodePath.forEach((item) => {
        item.ChildNode = null
      })
      nodePath[0].ChildNode = [childData]

      const ret = {
        ResultCode: 200,
        Data: nodePath
      }
      resolve(ret)
    }, 500)
  })
}
/**DeptId, */
export function editDeptApi(params) {
  console.log('params:'+JSON.stringify(params))
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      updateNodeName(jsonData.Data, params.DeptId, params.Name);
      const nodePath = deepclone(findNodeAndParents(jsonData.Data, params.DeptId) || [])
      // 编辑
      nodePath.forEach((item) => {
        item.ChildNode = null
      })
      const ret = {
        ResultCode: 200,
        Data: nodePath
      }
      resolve(ret)
    }, 500)
  })
}

/**
 * 获取部门和用户列表
 * @param {Object} params 请求参数
 * @param {Number} params.PageIndex 页码
 * @param {Number} params.PageSize 每页大小
 * @param {String|null} params.DeptId 部门ID，为null时获取顶级部门
 * @param {String} params.DeptName 搜索关键词
 * @returns {Promise<Object>} 包含部门和用户列表以及面包屑导航信息
 */

export function QueryDeptsApi(params) {
  console.log('params:'+JSON.stringify(params))
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      // 实际项目中应该使用真实的API请求
      // 开发环境使用本地JSON数据模拟
      // const response = await fetch('./department_modified.json');
      let resData = deepclone(jsonData);//await response.json();

      if (resData.ResultCode !== 200) {
        alert("error")
        return;
      }
      // 是否返回员工数据 getuser：1返回，否则值返回部门
      let allData = params.getuser == 1 ? resData.Data : filterLevel2Nodes(resData.Data, 2)
      let data = params.DeptId ? getDirectChildrenAndClear(allData, params.DeptId) : allData;

      // 模拟搜索功能
      if (params.DeptName) {
        
        const odata = flattenTree(allData).filter(item => item.Name.includes(params.DeptName.trim()));
        data = odata.slice((params.PageIndex - 1) * params.PageSize, (params.PageIndex) * params.PageSize)
        data.forEach(item => item.ChildNode = null)

        console.log(odata);

        const HasMore = params.PageIndex * params.PageSize < odata.length;
        const retdata = {
          ResultCode: 200,
          DataTotal: odata.length,
          Data: data,
          HasMore
        }
        console.log("response:");
        console.log(retdata);

        // 搜索时不返回面包屑
        resolve(retdata)
        return
      }



      // 模拟分页
      if (params.PageIndex > 1) {
        // 模拟第二页没有数据
        data = data.slice((params.PageIndex - 1) * params.PageSize, (params.PageIndex) * params.PageSize)
        data.forEach(item => item.ChildNode = null)
        // 判断是否还有更多数据
        const HasMore = params.PageIndex * params.PageSize < getDirectChildrenAndClear(allData, params.DeptId).length;//resData.DataTotal;
        const retdata = {
          ResultCode: 200,
          DataTotal: getDirectChildrenAndClear(allData, params.DeptId).length,
          Data: data,
          HasMore
        }
        console.log("response:");
        console.log(retdata);
        resolve(retdata)

        return;
      }


      data = data.slice((params.PageIndex - 1) * params.PageSize, (params.PageIndex) * params.PageSize)

      data.forEach(item => item.ChildNode = null)

      // 判断是否还有更多数据
      // const HasMore = data && data.length && data[0].Level === 0 ? true : params.PageIndex * params.PageSize < getDirectChildrenAndClear(allData, params.DeptId).length;
      const HasMore = params.PageIndex * params.PageSize < getDirectChildrenAndClear(allData, params.DeptId).length;
      const retdata = {
        ResultCode: 200,
        DataTotal: getDirectChildrenAndClear(allData, params.DeptId).length,
        Data: data,
        HasMore
      }
      console.log("response:");
      console.log(retdata);
      resolve(retdata)
    }, 500)


  })
  // try {

  // } catch (error) {
  //   console.error('获取部门和用户列表失败:', error);
  //   throw error;
  // }
}




