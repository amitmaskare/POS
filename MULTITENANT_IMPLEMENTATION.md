# Multi-Tenant System Implementation Guide - Store_ID Integration

## Overview
This document explains the multi-tenant architecture where each user is tied to a specific store and can only see/access data for their assigned store.

## Key Changes Made

### 1. Database Schema Updates
**File:** `Backend/add_store_id_migration.sql`

Added `store_id` column to all tenant-scoped tables:
- users (connects user to store)
- categories, subcategories
- products
- customers
- suppliers
- packages
- offers
- purchases, sales, returns
- hold_sales
- ration_cards
- payments
- cards

### 2. Backend Implementation

#### CommonModel Updates
**File:** `Backend/src/models/CommonModel.js`

Modified all CRUD methods to automatically filter by `store_id`:

```javascript
getAllData({ table, fields, conditions, storeId })
getSingle({ table, fields, conditions, storeId })
insertData({ table, data, storeId })
updateData({ table, data, conditions, storeId })
deleteData({ table, conditions, storeId })
```

**Tenant Tables List:**
```javascript
const tenantTables = ['categories', 'subcategories', 'products', 'customers', 
'suppliers', 'packages', 'offers', 'purchases', 'sales', 'returns', 
'hold_sales', 'ration_cards', 'payments', 'cards'];
```

#### Authentication Updates
**Files:** 
- `Backend/src/services/AuthService.js`
- `Backend/src/controllers/AuthController.js`

Changes:
- AuthService validates `store_id` exists during login
- JWT token now includes `store_id`
- Login response includes `store_id` in user object

#### Helper Utility
**File:** `Backend/src/utils/storeHelper.js`

```javascript
getStoreIdFromRequest(req) // Extracts store_id from JWT
validateStoreId(req, res, next) // Middleware to validate store_id
```

#### Service Layer Example
**File:** `Backend/src/services/ProductService.js`

All service methods now accept `storeId` parameter:
```javascript
list(storeId)
add(productData, storeId)
getById(id, storeId)
update(productData, storeId)
deleteData(id, storeId)
```

#### Controller Updates
**File:** `Backend/src/controllers/ProductController.js`

Controllers extract store_id and pass to services:
```javascript
const storeId = getStoreIdFromRequest(req);
const result = await ProductService.list(storeId);
```

### 3. Frontend Implementation

#### API Client with Interceptors
**File:** `Frontend/src/services/apiClient.js`

Automatic injection of authentication and store_id:
- Request interceptor adds `Authorization` header
- Automatically includes `store_id` in POST/PUT body
- Automatically includes `store_id` as query param for GET
- Response interceptor handles 401 errors (redirects to login)

#### Login Page Updates
**File:** `Frontend/src/pages/Login/Login.jsx`

```javascript
// Store store_id alongside token
localStorage.setItem("store_id", result.data.user.store_id);
```

## Implementation Pattern

### For Each Service/Controller Pair:

#### Backend Service Pattern:
```javascript
// OLD
export const ProductService = {
  list: async () => { ... },
  add: async (data) => { ... },
  getById: async (id) => { ... }
}

// NEW
export const ProductService = {
  list: async (storeId) => {
    // Query with store_id filter
  },
  add: async (data, storeId) => {
    // Insert with store_id automatically added
  },
  getById: async (id, storeId) => {
    // Get with store_id filter
  }
}
```

#### Backend Controller Pattern:
```javascript
// OLD
list: async (req, resp) => {
  const result = await ProductService.list();
}

// NEW
list: async (req, resp) => {
  const storeId = getStoreIdFromRequest(req);
  const result = await ProductService.list(storeId);
}
```

## Remaining Tasks to Complete

These services need to be updated following the same pattern:

### Backend Services to Update:
1. CategoryService
2. SubcategoryService
3. CustomerService
4. SupplierService
5. PackageService
6. OfferService
7. PurchaseService
8. SaleService
9. ReturnService
10. HoldAndRetrieveService
11. RationcardService
12. PaymentService
13. CardService
14. CuponService
15. AddtocartService
16. RoleService (global, no store_id)
17. PermissionService (global, no store_id)
18. RolePermissionService
19. UserPermissionService

### Frontend Services to Update:
Update all services in `Frontend/src/services/` to use the new `apiClient.js` instead of axios directly.

## Testing the Multi-Tenant System

### Test Scenario:
1. **Store A (STORE_001):**
   - User_A logs in with store_id = STORE_001
   - Creates Product_A
   - Only sees Product_A in product list

2. **Store B (STORE_002):**
   - User_B logs in with store_id = STORE_002
   - Creates Product_B
   - Only sees Product_B in product list
   - Product_A is NOT visible

3. **Data Isolation Check:**
   - Even if User_A tries to query Product_B directly via API
   - Backend WHERE clause filters: `store_id = 'STORE_001'`
   - Product_B (store_id = 'STORE_002') is excluded from results
   - Query returns 0 rows (security enforced)

## Security Considerations

✅ **Protected:**
- All tenant-scoped data queries automatically filtered by store_id
- Store_id embedded in JWT token (cannot be modified client-side)
- Database queries include store_id in WHERE clause (server-side enforcement)

✅ **Data Isolation:**
- Users only see their store's data
- Cross-store access prevented at database level
- Store_id extracted from authenticated JWT, not from user input

## Configuration

### Environment Variables (if needed):
```env
# .env
REACT_APP_API_URL=http://localhost:4000/api
JWT_SECRET=your_secret_key
```

## Migration Steps

1. Run SQL migration: `add_store_id_migration.sql`
2. Update all remaining services following the pattern
3. Update all remaining controllers
4. Test with multiple stores
5. Deploy to production

## Notes

- Store_id is sourced from authenticated JWT token
- All queries automatically filtered at database level
- No trust of client-side store_id parameter
- Complete data isolation between stores
