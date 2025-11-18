
export const UseBreadcrum = () => {

    var depItems = []
    var depIds = []

    /**
     * 获取部门路径
     * @param {Array} data 原始数据
     * @param {String} deptId 部门ID
     * @returns {Promise<Array>} 部门路径数组，从根部门到当前部门
     */
    function getDepartmentPath(currentDept, companyItem) {
        // 初始加载
        if (!currentDept) {
            depIds = [""]
            depItems = [{ Name: companyItem.Name, PK_Guid: "" }]
            return depItems
        }

        // 存在路径中
        var index = depIds.indexOf(currentDept.PK_Guid)
        if (currentDept && index !== -1) {
            depIds = depIds.slice(0, index + 1)
            depItems = depItems.slice(0, index + 1)
        } else {
            depIds.push(currentDept.PK_Guid)
            depItems.push({ ...currentDept })
        }

        return depItems;
    }

    /**
     * 清除部门路径缓存
     */
    function clearDepartmentPathCache() {
        depItems = [];
        depIds = [];
    }




    return {
        getDepartmentPath,
        clearDepartmentPathCache
    }
}



