// Template for updating backend services
// Copy this template and apply to each service file

// BEFORE:
export const CategoryService = {
  list: async () => {
    return await CommonModel.getAllData({ table: "categories" });
  },
  
  add: async (data) => {
    return await CommonModel.insertData({ table: "categories", data });
  },
  
  getById: async (id) => {
    return await CommonModel.getSingle({ table: "categories", conditions: { id } });
  },
  
  update: async (data) => {
    const { id, ...updateData } = data;
    return await CommonModel.updateData({ table: "categories", data: updateData, conditions: { id } });
  },
  
  deleteData: async (id) => {
    return await CommonModel.deleteData({ table: "categories", conditions: { id } });
  }
};

// AFTER:
export const CategoryService = {
  list: async (storeId) => {
    return await CommonModel.getAllData({ table: "categories", storeId });
  },
  
  add: async (data, storeId) => {
    return await CommonModel.insertData({ table: "categories", data, storeId });
  },
  
  getById: async (id, storeId) => {
    return await CommonModel.getSingle({ table: "categories", conditions: { id }, storeId });
  },
  
  update: async (data, storeId) => {
    const { id, ...updateData } = data;
    return await CommonModel.updateData({ table: "categories", data: updateData, conditions: { id }, storeId });
  },
  
  deleteData: async (id, storeId) => {
    return await CommonModel.deleteData({ table: "categories", conditions: { id }, storeId });
  }
};

// ============================================
// TEMPLATE FOR CONTROLLERS
// ============================================

// BEFORE:
list: async (req, resp) => {
  try {
    const result = await CategoryService.list();
    return sendResponse(resp, true, 200, "Success", result);
  } catch (error) {
    return sendResponse(resp, false, 500, error.message);
  }
}

// AFTER:
list: async (req, resp) => {
  try {
    const storeId = getStoreIdFromRequest(req);
    const result = await CategoryService.list(storeId);
    return sendResponse(resp, true, 200, "Success", result);
  } catch (error) {
    return sendResponse(resp, false, 500, error.message);
  }
}

// ============================================
// GLOBAL SERVICES (NO STORE_ID NEEDED)
// ============================================

// These services handle system-wide data, not store-specific:
// - RoleService (roles are system-wide)
// - PermissionService (permissions are system-wide)
// - Note: But RolePermissionService IS store-scoped and needs storeId

// ============================================
// SERVICES THAT USE RAW QUERIES
// ============================================

// For services with custom SQL queries, add store_id condition:

// BEFORE:
searchProduct: async (search) => {
  const query = `
    SELECT p.* FROM products p
    WHERE p.product_name LIKE ?
  `;
  return await CommonModel.rawQuery(query, [`%${search}%`]);
}

// AFTER:
searchProduct: async (search, storeId) => {
  const query = `
    SELECT p.* FROM products p
    WHERE p.product_name LIKE ? AND p.store_id = ?
  `;
  return await CommonModel.rawQuery(query, [`%${search}%`, storeId]);
}
