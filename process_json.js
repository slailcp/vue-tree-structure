const fs = require('fs');
const path = require('path');

// ========== 配置部分（可按需调整） ==========
const CONFIG = {
  // 生成多少个根公司（Level 0）
  rootCount: 2,
  // 每个根公司下的一级部门数量范围（Level 1）
  rootDept: { min: 0, max: 8 },
  // 根公司直挂员工数量范围（Level 2，直接挂在 Level 0 下）
  rootEmployees: { min: 0, max: 1 },
  // 部门嵌套的最大层级（部门本身 Level 永远是 1，但我们用深度控制嵌套层数）
  maxDeptDepth: 5,
  // 每个部门的子部门数量范围（Level 1 -> Level 1 的嵌套）
  subDept: { min: 0, max: 7 },
  // 每个部门直挂员工数量范围（Level 2）
  deptEmployees: { min: 0, max: 2 },
  // 分页与总数信息
  pagesize: 10
};

// ===== 名称生成器：生成200个不重复的部门与人员名称（无数字后缀） =====
function generateDepartmentNames(count) {
  const baseDept = [
    '研发', '市场', '销售', '人力资源', '财务', '行政', '客服', '产品', '运营', '技术',
    '质量', '法务', '采购', '物流', '战略', '公关', '设计', '培训', '安全', '数据',
    '审计', '风控', '品牌', '传播', '信息', 'IT', '基础架构', '测试', '支持', '内容',
    '新媒体', '创新', '孵化', '项目', '计划', '交付', '供应链', '税务', '海外', '国际',
    '区域', '华北', '华东', '华南', '西南', '西北', '东北', '中原', '研究', '投研'
  ];
  const adjectives = [
    '卓越', '精英', '先锋', '云端', '星辰', '未来', '新锐', '智慧', '敏捷', '光速',
    '极客', '融合', '数智', '蓝海', '高能', '洞察', '精进', '星火', '凌云', '启航',
    '领航', '擎天', '逐日', '逐梦', '晨曦', '曙光', '青云', '远航', '轻舟', '沐风',
    '长风', '银海', '星河', '麒麟', '龙腾', '凤舞', '虎跃', '鲲鹏', '凌霄', '北辰',
    '海纳', '宇航', '云海', '泰岳', '瀚海', '华彩', '明德', '厚道', '博雅', '睿智'
  ];
  const set = new Set();
  const names = [];
  // 先加入基础部门
  for (const n of baseDept) {
    const name = `${n}部`;
    if (!set.has(name)) {
      set.add(name);
      names.push(name);
      if (names.length >= count) return names;
    }
  }
  // 通过形容词 + 部门组合生成
  for (const adj of adjectives) {
    for (const n of baseDept) {
      const name = `${adj}${n}部`;
      if (!set.has(name)) {
        set.add(name);
        names.push(name);
        if (names.length >= count) return names;
      }
    }
  }
  // 若仍不足，补充通用名称
  let i = 1;
  while (names.length < count) {
    const name = `事业群${i}`; // 仅用于填充，但不带数字后缀的部门名称不够时，这里仍避免数字后缀
    const alt = `中心${i}`;
    const pick = names.length % 2 === 0 ? `事业中心` : `综合管理中心`;
    if (!set.has(pick)) {
      set.add(pick);
      names.push(pick);
    }
    i++;
  }
  return names.slice(0, count);
}

function generatePersonNames(count) {
  const surnames = [
    '赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨',
    '朱','秦','尤','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜',
    '戚','谢','邹','喻','柏','水','窦','章','云','苏','潘','葛','奚','范','彭','鲁'
  ];
  const givenChars = [
    '伟','芳','娜','敏','静','霞','强','超','磊','洋','兵','梅','杰','琳','颖','慧',
    '琪','涵','博','宇','翔','宁','雪','晨','辉','玉','佳','乐','东','鹏','坤','帆',
    '诚','然','昊','萱','璐','瑶','芸','彦','菲','晨','筱','悦','可','灿','朗','昕'
  ];
  const set = new Set();
  const names = [];
  for (const s of surnames) {
    for (let i = 0; i < givenChars.length; i++) {
      for (let j = i + 1; j < givenChars.length; j++) {
        const name = s + givenChars[i] + givenChars[j];
        if (!set.has(name)) {
          set.add(name);
          names.push(name);
          if (names.length >= count) return names;
        }
      }
    }
  }
  // 若仍不足，用单字名补足
  for (const s of surnames) {
    for (const c of givenChars) {
      const name = s + c;
      if (!set.has(name)) {
        set.add(name);
        names.push(name);
        if (names.length >= count) return names;
      }
    }
  }
  return names.slice(0, count);
}

const departmentNames = generateDepartmentNames(200);
const personNames = generatePersonNames(200);

// 生成唯一ID的函数
let idCounter = 100000;
function generateUniqueId() {
  return (idCounter++).toString();
}

// 创建GUID到新ID的映射
const guidToIdMap = new Map();
// 工具函数：生成[min, max]之间的随机整数
function randInt(min, max) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + Math.floor(Math.random() * (high - low + 1));
}

// 生成一个员工节点（Level 2）
function createEmployee(parentGuid) {
  const id = generateUniqueId();
  return {
    PK_Guid: id,
    Name: personNames[Math.floor(Math.random() * personNames.length)],
    Level: 2,
    ChildNode: null,
    // ParentGuid: parentGuid,
    // ManagerGuid: null,
    // ManagerName: null,
    // UserCode: null,
    // MobilePhone: null
  };
}

// 生成一个部门（Level 1），按深度递归生成子部门与员工，并计算UserCount
function createDepartment(parentGuid, depth, maxDepth) {
  const id = generateUniqueId();
  const name = departmentNames[Math.floor(Math.random() * departmentNames.length)];
  const childNodes = [];

  // 子部门
  const subDeptCount = depth < maxDepth ? randInt(CONFIG.subDept.min, CONFIG.subDept.max) : 0;
  for (let i = 0; i < subDeptCount; i++) {
    const subDept = createDepartment(id, depth + 1, maxDepth);
    childNodes.push(subDept);
  }

  // 直挂员工
  const employeeCount = randInt(CONFIG.deptEmployees.min, CONFIG.deptEmployees.max);
  for (let i = 0; i < employeeCount; i++) {
    childNodes.push(createEmployee(id));
  }

  // 计算UserCount（包含直挂员工和所有子部门员工）
  const deptEmployeeCount = childNodes
    .filter(n => n.Level === 1)
    .reduce((sum, d) => sum + (d.UserCount || 0), 0);
  const directEmployeeCount = childNodes.filter(n => n.Level === 2).length;

  return {
    PK_Guid: id,
    Name: name,
    Level: 1,
    ChildNode: childNodes.length ? childNodes : null,
    // ParentGuid: parentGuid,
    // ManagerGuid: null,
    // ManagerName: '',
    // UserCode: null,
    // MobilePhone: null,
    UserCount: deptEmployeeCount + directEmployeeCount
  };
}

// 生成一个根公司节点（Level 0），包含一级部门与直挂员工
function createRoot(index) {
  const id = generateUniqueId();
  const name = `测试公司${index + 1}`;
  const childNodes = [];

  // 一级部门
  const deptCount = randInt(CONFIG.rootDept.min, CONFIG.rootDept.max);
  for (let i = 0; i < deptCount; i++) {
    childNodes.push(createDepartment(id, 1, CONFIG.maxDeptDepth));
  }

  // 根直挂员工
  const rootEmpCount = randInt(CONFIG.rootEmployees.min, CONFIG.rootEmployees.max);
  for (let i = 0; i < rootEmpCount; i++) {
    childNodes.push(createEmployee(id));
  }

  // 计算根的用户数（同样是子部门员工总和 + 根直挂员工）
  const deptEmployeeCount = childNodes
    .filter(n => n.Level === 1)
    .reduce((sum, d) => sum + (d.UserCount || 0), 0);
  const directEmployeeCount = childNodes.filter(n => n.Level === 2).length;
  return {
    PK_Guid: id,
    Name: name,
    Level: 0,
    ChildNode: childNodes.length ? childNodes : null,
    // ParentGuid: '',
    // ManagerGuid: null,
    // ManagerName: '',
    // UserCode: null,
    // MobilePhone: null,
    UserCount: deptEmployeeCount + directEmployeeCount
  };
}

// ========== 生成完整数据 ==========
const roots = [];
for (let i = 0; i < CONFIG.rootCount; i++) {
  roots.push(createRoot(i));
}

const jsonData = {
  ResultCode: 200,
  DataTotal: roots.length,
  Pagesize: CONFIG.pagesize,
  HasMore: true,
  Data: roots
};

// 保存修改后的JSON文件
// fs.writeFileSync(
//   path.join(__dirname, 'src/apidepartment_modified.json'),
//   JSON.stringify(jsonData, null, 3),
//   'utf8'
// );
fs.writeFileSync(
  path.join(__dirname, 'src/api/department_modified.js'),
  'const deepclone = (obj) => JSON.parse(JSON.stringify(obj));export var jsonData = ' + JSON.stringify(jsonData, null, 3)+';export default deepclone(jsonData);',
  'utf8'
);

console.log('JSON文件生成完成（合成数据），已保存为 department_modified.json 与 department_modified.js');
