
import jsonData from "/src/api/department_modified.js";

export const deepclone = (obj) => JSON.parse(JSON.stringify(obj));

/**随机数 */
export const getRandom = (num) => {
  const ret = Math.floor(Math.random() * num);
  return ret;
};
/**生成随机展开数组id */
export const getLevelNode = () => {
  const data = deepclone(jsonData?.Data) || [];
  const levels = [];
  let currentNode = null;
  const oIndex = Math.floor(Math.random() * data.length);

  // 获取公司节点
  if (data.length >= oIndex) {
    currentNode = data[oIndex];
    currentNode && levels.push(currentNode);
  }

  // 递归获取后续层级节点（最多7层）
  for (let i = 0; i < 7; i++) {
    if (!currentNode?.ChildNode?.length) break;

    // 筛选Level为1的子节点
    const childNodes = currentNode.ChildNode.filter((node) => node.Level === 1);
    if (!childNodes.length) break;

    // 随机选择子节点并添加到层级列表
    currentNode = childNodes[getRandom(childNodes.length)];
    levels.push(currentNode);
  }

  return levels;
};

/**获取更新，新增，删除部门的时候的参数 */
const guids = new Set();
const operateData = deepclone(jsonData.Data);
export const getOperateData = (type) => {
  const company = (operateData[0]);
  const dep = (company.ChildNode[0] || {}); // 兼容空节点情况

  if (type === 1) {
    dep.Name = "随机名字" + getRandom(1000);
    dep.UserCount = parseInt(Math.random() * 100);
    console.log(`编辑操作`);
  }

  if (type === 2) {
    const glist = Array.from(guids)
    const item = { PK_Guid: `10000a${glist.length + 1}`, Name: `新增${glist.length + 1}部门`, Level: 1, UserCount: 0 }
    guids.add(item.PK_Guid);
    dep.ChildNode = [item];
    delete dep.DelIdList;
    console.log(`新增操作`);
  }

  if (type === 3) {
    // 从dep.ChildNode中获取PK_Guid填充到delIdList
    const id = Array.from(guids).pop();
    if (id) {
      dep.DelIdList = [id];
      dep.ChildNode = [];
      guids.delete(id);
    } else {
      delete dep.DelIdList;
    }
    console.log(`删除操作`);
  }

  console.log([dep, company]);

  return [dep, company];
};

export const getChooseOptions = () => {
  const options = [];
  deepclone(jsonData).Data.forEach((item) => {
    options.push({ value: item, label: item.Name, parentName: '无', space: 0 });
    getlist((item.ChildNode || []), item.Name, 2)
  });
  function getlist(ChildNode, name, space) {
    ChildNode.forEach((child) => {
      options.push({ value: child, label: `${child.Name}`, parentName: name, space: space });
      // 只加载第一级子部门，全部加载页面会卡
      // getlist((child.ChildNode || []), `${name}=>${child.Name}`, `${Number(space) + 2}`)
    });
  }
  return options;
}