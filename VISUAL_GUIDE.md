# Multi-Tenant System - Visual Guide & Reference

## 🎬 Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STORE A USER (STORE_001)                         │
│                                                                      │
│  1. Opens Login Page                                                │
│     ├─ Enters: user_id=1, password=****                            │
│     └─ Clicks: Login                                               │
│                                                                      │
│  2. Backend Processes:                                              │
│     ├─ Validates credentials                                       │
│     ├─ Fetches store_id from users table → STORE_001              │
│     ├─ Creates JWT with:                                           │
│     │  {                                                            │
│     │    userId: 1,                                                │
│     │    role: "admin",                                            │
│     │    store_id: "STORE_001",    ← IMMUTABLE                   │
│     │    permissions: [...]                                        │
│     │  }                                                            │
│     └─ Returns: token + user data                                  │
│                                                                      │
│  3. Frontend Stores:                                                │
│     ├─ localStorage.token = "eyJhbGc..."                           │
│     ├─ localStorage.store_id = "STORE_001"                         │
│     └─ localStorage.user = { name, role, ... }                     │
│                                                                      │
│  4. User Navigates to Products Page                                │
│     ├─ Clicks: "Products"                                          │
│     └─ Frontend calls: GET /api/product/list                       │
│                                                                      │
│  5. Frontend API Call:                                              │
│     ├─ apiClient intercepts request                                │
│     ├─ Adds header: Authorization: Bearer <JWT_with_store_id>     │
│     ├─ Headers include: X-Store-ID: STORE_001 (optional)          │
│     └─ Sends request                                               │
│                                                                      │
│  6. Backend Processes Request:                                      │
│     ├─ AuthMiddleware extracts JWT                                 │
│     ├─ Verifies signature (cannot tamper)                          │
│     ├─ Extracts: store_id = "STORE_001" (from JWT)               │
│     ├─ Controller method runs:                                     │
│     │  const storeId = getStoreIdFromRequest(req);                │
│     │  // storeId = "STORE_001"                                   │
│     ├─ Calls service:                                              │
│     │  ProductService.list(storeId)                               │
│     └─ Service executes query:                                     │
│        SELECT * FROM products WHERE store_id = 'STORE_001'        │
│                                                                      │
│  7. Database Returns:                                               │
│     ├─ Product A (store_id = STORE_001) ✅ INCLUDED               │
│     ├─ Product B (store_id = STORE_002) ❌ EXCLUDED               │
│     ├─ Product C (store_id = STORE_001) ✅ INCLUDED               │
│     └─ Result: [Product A, Product C]                             │
│                                                                      │
│  8. Frontend Displays:                                              │
│     └─ Product list shows ONLY: Product A, Product C              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

                              SIMULTANEOUSLY

┌─────────────────────────────────────────────────────────────────────┐
│                    STORE B USER (STORE_002)                         │
│                                                                      │
│  Same flow but:                                                     │
│  - JWT contains: store_id: "STORE_002"                             │
│  - Backend query: WHERE store_id = 'STORE_002'                     │
│  - Sees: Product B, Product D                                      │
│  - Does NOT see: Product A, Product C (from Store A)              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Login.jsx                                                   │   │
│  │  ├─ User enters: user_id, password                          │   │
│  │  └─ Stores in localStorage:                                │   │
│  │     • token = JWT with store_id                            │   │
│  │     • store_id = "STORE_001"                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  apiClient.js (Interceptors)                                │   │
│  │  ├─ Request: Add Authorization header                      │   │
│  │  ├─ Request: Add store_id to body/params                  │   │
│  │  ├─ Response: Handle 401 (redirect to login)              │   │
│  │  └─ Silently manages store_id injection                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Service Layer (productService.js, etc)                     │   │
│  │  ├─ Imports: import apiClient from "./apiClient"           │   │
│  │  ├─ Calls: apiClient.get("/product/list")                 │   │
│  │  └─ (store_id auto-injected by interceptor)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↕ HTTP
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express)                            │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  AuthMiddleware                                              │   │
│  │  ├─ Reads: Authorization header                            │   │
│  │  ├─ Verifies: JWT signature                                │   │
│  │  ├─ Extracts: store_id from JWT                            │   │
│  │  └─ Attaches: req.user = { userId, store_id, ... }        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Controller Layer                                            │   │
│  │  ├─ Import: getStoreIdFromRequest from storeHelper         │   │
│  │  ├─ Extract: storeId = getStoreIdFromRequest(req)         │   │
│  │  ├─ Call: Service.method(params, storeId)                 │   │
│  │  └─ Send: Response to frontend                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Service Layer                                               │   │
│  │  ├─ Receive: storeId parameter                             │   │
│  │  ├─ Call: CommonModel.getAllData({ ..., storeId })        │   │
│  │  ├─ Pass: storeId to model                                 │   │
│  │  └─ Return: Filtered results                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CommonModel (Data Access Layer)                            │   │
│  │  ├─ Receive: storeId parameter                             │   │
│  │  ├─ Build Query: "... WHERE store_id = ?"                 │   │
│  │  ├─ Execute: pool.query(sql, [storeId])                   │   │
│  │  └─ Return: Results from database                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌──────────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Query: SELECT * FROM products WHERE store_id = 'STORE_001' │   │
│  │                                                              │   │
│  │  Results:                                                   │   │
│  │  ├─ Product_001 (store_id: STORE_001) ✅                 │   │
│  │  ├─ Product_002 (store_id: STORE_002) ❌                 │   │
│  │  ├─ Product_003 (store_id: STORE_001) ✅                 │   │
│  │  └─ ...                                                     │   │
│  │                                                              │   │
│  │  Returns to Backend: [Product_001, Product_003]            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: Authentication (Login)                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ User enters credentials → Backend validates              │ │
│  │ → Retrieves store_id from database                       │ │
│  │ → Embeds in JWT (immutable)                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: JWT Token (Immutable)                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ JWT = HEADER . PAYLOAD . SIGNATURE                        │ │
│  │                                                            │ │
│  │ PAYLOAD:                                                  │ │
│  │ {                                                          │ │
│  │   "userId": 1,                                           │ │
│  │   "email": "user@store.com",                            │ │
│  │   "store_id": "STORE_001",  ← CANNOT MODIFY            │ │
│  │   "role": "admin",                                       │ │
│  │   "iat": 1707000000,                                     │ │
│  │   "exp": 1707086400                                      │ │
│  │ }                                                          │ │
│  │                                                            │ │
│  │ SIGNATURE: HMAC-SHA256(header.payload, SECRET)           │ │
│  │            ↑ Changes if payload modified ↑               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: Server-Side Extraction (Not Client Input)            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Backend extracts store_id from JWT token                 │ │
│  │                                                            │ │
│  │ const storeId = req.user.store_id;  ← From JWT, SAFE    │ │
│  │ NOT from request.body.store_id      ← From client, UNSAFE│ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: Database Query Filtering                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ SELECT * FROM products                                    │ │
│  │ WHERE id = 5                                              │ │
│  │ AND store_id = 'STORE_001'     ← MANDATORY               │ │
│  │                                                            │ │
│  │ If store_id doesn't match, row is excluded               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5: Application Logic Enforcement                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Services REQUIRE storeId parameter:                       │ │
│  │                                                            │ │
│  │ // Cannot call without storeId:                          │ │
│  │ ProductService.getById(5)        ❌ ERROR               │ │
│  │                                                            │ │
│  │ // Must always provide storeId:                          │ │
│  │ ProductService.getById(5, storeId)  ✅ OK               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Isolation Example

```
DATABASE CONTENTS:
┌─────────┬──────────────┬──────────┐
│ id      │ product_name │ store_id │
├─────────┼──────────────┼──────────┤
│ 1       │ Soap         │ STORE_001│
│ 2       │ Water Bottle │ STORE_001│
│ 3       │ Shampoo      │ STORE_002│
│ 4       │ Toothpaste   │ STORE_002│
│ 5       │ Toothbrush   │ STORE_001│
│ 6       │ Handwash     │ STORE_002│
└─────────┴──────────────┴──────────┘

STORE A USER (STORE_001):
└─ Request: GET /api/product/list
└─ JWT contains: store_id = 'STORE_001'
└─ Backend executes:
   SELECT * FROM products WHERE store_id = 'STORE_001'
└─ Database returns:
   ┌─────────┬──────────────┬──────────┐
   │ id      │ product_name │ store_id │
   ├─────────┼──────────────┼──────────┤
   │ 1       │ Soap         │ STORE_001│ ✅
   │ 2       │ Water Bottle │ STORE_001│ ✅
   │ 5       │ Toothbrush   │ STORE_001│ ✅
   └─────────┴──────────────┴──────────┘
└─ Frontend displays: 3 products (Soap, Water Bottle, Toothbrush)

STORE B USER (STORE_002):
└─ Request: GET /api/product/list
└─ JWT contains: store_id = 'STORE_002'
└─ Backend executes:
   SELECT * FROM products WHERE store_id = 'STORE_002'
└─ Database returns:
   ┌─────────┬──────────────┬──────────┐
   │ id      │ product_name │ store_id │
   ├─────────┼──────────────┼──────────┤
   │ 3       │ Shampoo      │ STORE_002│ ✅
   │ 4       │ Toothpaste   │ STORE_002│ ✅
   │ 6       │ Handwash     │ STORE_002│ ✅
   └─────────┴──────────────┴──────────┘
└─ Frontend displays: 3 products (Shampoo, Toothpaste, Handwash)

COMPLETE DATA ISOLATION:
- Store A sees: 1, 2, 5
- Store B sees: 3, 4, 6
- Cross-store access: IMPOSSIBLE
```

---

## 🔄 Update Pattern Template

```javascript
// ================================
// BEFORE (Single Store)
// ================================

// Service
export const ProductService = {
  list: async () => {
    return await CommonModel.getAllData({ 
      table: "products" 
    });
  }
}

// Controller
list: async (req, resp) => {
  const result = await ProductService.list();
  return sendResponse(resp, true, 200, "Success", result);
}

// ================================
// AFTER (Multi-Tenant)
// ================================

// Service
export const ProductService = {
  list: async (storeId) => {
    return await CommonModel.getAllData({ 
      table: "products",
      storeId  // ← Add this
    });
  }
}

// Controller
import { getStoreIdFromRequest } from "../utils/storeHelper.js";

list: async (req, resp) => {
  const storeId = getStoreIdFromRequest(req);  // ← Add this
  const result = await ProductService.list(storeId);  // ← Add storeId
  return sendResponse(resp, true, 200, "Success", result);
}

// ================================
// APPLIES TO ALL OPERATIONS:
// ================================

// list()       → list(storeId)
// add()        → add(data, storeId)
// getById()    → getById(id, storeId)
// update()     → update(data, storeId)
// delete()     → delete(id, storeId)
```

---

## ✅ Verification Checklist

```
After implementing multi-tenant system:

AUTHENTICATION:
☐ User logs in with credentials
☐ Backend returns JWT with store_id
☐ Frontend stores store_id in localStorage
☐ Logout clears store_id

DATA ISOLATION:
☐ Store A user sees ONLY Store A data
☐ Store B user sees ONLY Store B data
☐ Cross-store product access returns 0 results
☐ Cross-store customer access returns 0 results
☐ Cross-store sale access returns 0 results

CREATE OPERATIONS:
☐ Creating product auto-adds store_id
☐ Cannot create product for another store
☐ store_id from JWT is used, not request body

UPDATE OPERATIONS:
☐ Can only update own store's data
☐ Cannot update other store's data
☐ Update includes store_id filter

DELETE OPERATIONS:
☐ Can only delete own store's data
☐ Cannot delete other store's data
☐ Delete includes store_id filter

API SECURITY:
☐ Removing JWT shows 401 error
☐ Expired JWT shows 401 error
☐ Invalid JWT shows 401 error
☐ Tampered JWT shows 401 error

REPORTS & ANALYTICS:
☐ Sales report shows ONLY own store's sales
☐ Product report shows ONLY own store's products
☐ Customer report shows ONLY own store's customers
☐ All aggregations filtered by store

EDGE CASES:
☐ Admin user still sees only their store's data
☐ Cannot switch stores without re-login
☐ Cannot use another user's token to access their data
☐ Shared resources properly filtered
```

---

This visual guide provides complete understanding of how the multi-tenant system works!
