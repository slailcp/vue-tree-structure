
// 将树级别数据拉平 
export function flattenTree(treelist) {
  const result = [];

  // 递归处理每个节点
  function processNode(node) {
    // 复制当前节点（排除ChildNode，避免保留嵌套结构）
    const { ChildNode, ...rest } = node;
    result.push(rest);

    // 处理子节点（如果存在且有效）
    if (ChildNode && Array.isArray(ChildNode) && ChildNode.length > 0) {
      ChildNode.forEach(child => processNode(child));
    }
  }

  // 遍历顶层数组
  treelist.forEach(node => processNode(node));

  return result;
}

// // 获取treelist下的targetPK的子节点，并拉平
// export function getFlattenedChildrenByPK(treelist, targetPK) {
//   const result = [];

//   // 递归查找目标节点并处理其子节点
//   function findAndFlatten(node) {
//     // 如果当前节点是目标PK，处理其所有子节点
//     if (node.PK_Guid === targetPK) {
//       flattenTree(node.ChildNode);
//       return true; // 找到目标后终止查找
//     }

//     // 否则继续查找子节点
//     if (node.ChildNode && Array.isArray(node.ChildNode) && node.ChildNode.length > 0) {
//       for (const child of node.ChildNode) {
//         if (findAndFlatten(child)) {
//           return true; // 找到后终止递归
//         }
//       }
//     }
//     return false;
//   }

//   // // 拉平子节点（递归处理所有层级）
//   // function flattenTree(children) {
//   //     if (!children || !Array.isArray(children) || children.length === 0) {
//   //         return;
//   //     }
//   //     children.forEach(child => {
//   //         // 复制节点（可根据需求决定是否保留ChildNode）
//   //         const { ChildNode, ...rest } = child;
//   //         result.push(rest);
//   //         // 继续处理下一级子节点
//   //         flattenTree(child.ChildNode);
//   //     });
//   // }

//   // 遍历顶层节点开始查找
//   for (const node of treelist) {
//     if (findAndFlatten(node)) {
//       break; // 找到目标后停止遍历
//     }
//   }

//   return result;
// }

//根据PK_Guid获取当前PK_Guid下的直接第一级ChildNode数据，并将ChildNode返回，并清空ChildNode列表中每一条数据下的ChildNode
export function getDirectChildrenAndClear(treelist, targetPK) {
  // 用于存储找到的直接子节点
  let directChildren = [];
  if (targetPK) {

    // 递归查找目标节点
    function findTargetNode(node) {
      // 找到目标节点，处理其直接第一级子节点
      if (node.PK_Guid === targetPK) {
        // 处理子节点（确保是数组）
        const children = node.ChildNode && Array.isArray(node.ChildNode) ? node.ChildNode : [];
        // 复制子节点并清空每个子节点的ChildNode
        directChildren = children.map(child => {
          // 深拷贝当前子节点（避免修改原数据引用）
          const copied = { ...child };
          // 清空子节点自身的ChildNode（无论原先是null还是数组）
          copied.ChildNode = null; // 或设置为[]，根据需求选择
          return copied;
        });
        return true; // 找到后终止查找
      }

      // 未找到则继续遍历子节点
      if (node.ChildNode && Array.isArray(node.ChildNode) && node.ChildNode.length > 0) {
        for (const child of node.ChildNode) {
          if (findTargetNode(child)) {
            return true; // 找到后终止递归
          }
        }
      }
      return false;
    }

    // 遍历顶层节点开始查找
    treelist.forEach(node => {
      findTargetNode(node);
    });
  } else {
    directChildren = treelist;
  }
  return directChildren;
}



// 根据Level过滤掉Level=2的节点
export function filterLevel2Nodes(treelist, Level) {
  // 递归处理单个节点及其子节点
  function processNode(node) {
    // 复制当前节点（避免修改原数据）
    const newNode = { ...node };

    // 如果有子节点，递归处理子节点
    if (newNode.ChildNode && Array.isArray(newNode.ChildNode) && newNode.ChildNode.length > 0) {
      // 过滤子节点：排除Level=2的节点，并递归处理剩余节点
      newNode.ChildNode = newNode.ChildNode
        .filter(child => child.Level !== Level) // 过滤Level=2的节点
        .map(child => processNode(child)); // 递归处理子节点
    }

    return newNode;
  }

  // 处理顶层数组
  return treelist.map(node => processNode(node));
}

export function updateNodeName(data, targetId, newName) {
  // 遍历数组中的每个节点
  data.forEach(node => {
    // 如果节点存在id且匹配目标id，则修改name
    if (node.PK_Guid === targetId) {
      node.Name = newName;
    }
    // 如果存在子节点数组，递归处理
    if (node.ChildNode && Array.isArray(node.ChildNode)) {
      updateNodeName(node.ChildNode, targetId, newName);
    }
  });
}

export function deepclone(target) {
  target = target; //  || {}
  if (typeof target !== 'object' || target == null || target instanceof Date) {
    return target
  }
  var ret;
  if (target instanceof Array) {
    ret = []
  } else {
    ret = {}
  }

  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      ret[key] = deepclone(target[key])
    }
  }
  return ret;
}


/**
 * 递归查找目标PK_Guid的节点及其所有父节点
 * @param {Array} data - 数据数组
 * @param {number} targetId - 目标ID
 * @param {Array} parentChain - 父节点链（递归时传递）
 * @returns {Array} 按“当前节点→父节点→更上层父节点”排列的数组
 */
export function findNodeAndParents(data, targetId, parentChain = []) {
  for (const node of data) {
    // 跳过空对象（无PK_Guid的节点）
    if (node.PK_Guid === undefined) continue;

    // 找到目标节点，返回“当前节点+父节点链”
    if (node.PK_Guid === targetId) {
      return [node, ...parentChain];
    }

    // 存在子节点时，递归查找（父节点链加入当前节点）
    if (node.ChildNode && Array.isArray(node.ChildNode)) {
      const result = findNodeAndParents(node.ChildNode, targetId, [node, ...parentChain]);
      if (result) return result; // 找到结果后终止递归
    }
  }
  // 未找到目标节点时返回null
  return null;
}


export function insertToChildNode(data, targetId, newData) {
  for (const node of data) {
    // 跳过无PK_Guid的空对象
    if (node.PK_Guid === undefined) continue;

    // 找到目标节点
    if (node.PK_Guid === targetId) {
      // 确保ChildNode是数组（如果不存在则初始化）
      if (!node.ChildNode || !Array.isArray(node.ChildNode)) {
        node.ChildNode = [];
      }
      // 在ChildNode第一条位置插入新数据
      node.ChildNode.unshift(newData);
      return true; // 插入成功，终止递归
    }

    // 递归查找子节点
    if (node.ChildNode && Array.isArray(node.ChildNode)) {
      const inserted = insertToChildNode(node.ChildNode, targetId, newData);
      if (inserted) return true; // 子节点中已插入，终止递归
    }
  }
  return false; // 未找到目标节点
}


export function deleteNodeById(data, targetId) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    // 跳过无PK_Guid的空对象
    if (node.PK_Guid === undefined) continue;

    // 找到目标节点，从数组中删除
    if (node.PK_Guid === targetId) {
      data.splice(i, 1); // 移除当前索引的节点
      return true; // 删除成功，终止递归
    }

    // 递归处理子节点数组
    if (node.ChildNode && Array.isArray(node.ChildNode)) {
      const deleted = deleteNodeById(node.ChildNode, targetId);
      if (deleted) return true; // 子节点中已删除，终止递归
    }
  }
  return false; // 未找到目标节点
}