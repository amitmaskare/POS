# Quick Update Checklist for Remaining Services

Copy this checklist and check off each service as you update it.

## Backend Services (Update all methods to accept `storeId` parameter)

### High Priority - Transaction Services:
- [ ] **PurchaseService** (`Backend/src/services/PurchaseService.js`)
  - [ ] list(storeId)
  - [ ] add(data, storeId)
  - [ ] getById(id, storeId)
  - [ ] update(data, storeId)
  - [ ] deleteData(id, storeId)

- [ ] **ReturnService** (`Backend/src/services/ReturnService.js`)
  - [ ] list(storeId)
  - [ ] add(data, storeId)
  - [ ] getById(id, storeId)
  - [ ] update(data, storeId)
  - [ ] deleteData(id, storeId)

- [ ] **PaymentService** (`Backend/src/services/PaymentService.js`)
  - [ ] list(storeId)
  - [ ] add(data, storeId)
  - [ ] getById(id, storeId)

- [ ] **HoldAndRetrieveService** (`Backend/src/services/HoldAndRetrieveService.js`)
  - [ ] list(storeId)
  - [ ] create(data, storeId)
  - [ ] retrieve(id, storeId)

### Medium Priority - Master Data Services:
- [ ] **CategoryService** (`Backend/src/services/CategoryService.js`)
- [ ] **SubcategoryService** (`Backend/src/services/SubcategoryService.js`)
- [ ] **CustomerService** (`Backend/src/services/CustomerService.js`)
- [ ] **SupplierService** (`Backend/src/services/SupplierService.js`)
- [ ] **PackageService** (`Backend/src/services/PackageService.js`)
- [ ] **OfferService** (`Backend/src/services/OfferService.js`)
- [ ] **RationcardService** (`Backend/src/services/RationcardService.js`)
- [ ] **CardService** (`Backend/src/services/CardService.js`)

### Lower Priority:
- [ ] **CuponService** (`Backend/src/services/CuponService.js`)
- [ ] **AddtocartService** (`Backend/src/services/AddtocartService.js`)
- [ ] **RolePermissionService** (`Backend/src/services/RolePermissionService.js`)
- [ ] **UserPermissionService** (`Backend/src/services/UserPermissionService.js`)

### Global Services (NO CHANGES NEEDED):
- ✅ **RoleService** - System-wide, not store-specific
- ✅ **PermissionService** - System-wide, not store-specific

## Backend Controllers (Update all to extract storeId and pass to services)

Each controller method should follow this pattern:
```javascript
methodName: async (req, resp) => {
  try {
    const storeId = getStoreIdFromRequest(req);  // ADD THIS
    const result = await Service.method(params, storeId);  // ADD storeId
    // ... rest of method
  }
}
```

- [ ] ProductController - ✅ DONE
- [ ] SaleController - ✅ DONE
- [ ] CategoryController
- [ ] SubcategoryController
- [ ] CustomerController
- [ ] SupplierController
- [ ] PackageController
- [ ] OfferController
- [ ] PurchaseController
- [ ] ReturnController
- [ ] PaymentController
- [ ] HoldAndRetrieveController
- [ ] RationcardController
- [ ] CardController
- [ ] CuponController
- [ ] AddtocartController
- [ ] RolePermissionController
- [ ] UserPermissionController

## Frontend Service Updates (Use apiClient.js for all API calls)

Update all files in `Frontend/src/services/` to use the new apiClient:

```javascript
// OLD
import axios from "axios"
const response = await axios.get(url, { headers: { Authorization: ... } })

// NEW
import apiClient from "./apiClient"
const response = await apiClient.get(url)
```

- [ ] productService.js
- [ ] categoryService.js
- [ ] customerService.js
- [ ] purchaseService.js
- [ ] saleService.js
- [ ] offerService.js
- [ ] rationcardService.js
- [ ] userService.js
- [ ] RoleService.js
- [ ] PermissionService.js
- [ ] RolePermissionService.js
- [ ] UserPermissionService.js
- [ ] HoldSaleService.js
- [ ] ReturnService.js

## Import Statement to Add

Add this import to all controllers that don't have it yet:
```javascript
import { getStoreIdFromRequest } from "../utils/storeHelper.js";
```

## Testing After Each Update

After updating each service/controller pair:
1. Test list operation - verify only store's data shown
2. Test create - verify store_id auto-added
3. Test update - verify can only update own store's data
4. Test delete - verify can only delete own store's data

## Verification Command

Run this to find all services still using old pattern:
```bash
# Find services not using storeId parameter
grep -r "async ()" Backend/src/services/*.js | grep -v storeId
```

## Final Testing Scenario

Once all updates complete:
1. Create 2 test stores (STORE_001, STORE_002)
2. Create 2 users (one per store)
3. User 1 creates: Product A, Customer 1, Sale 1
4. User 2 creates: Product B, Customer 2, Sale 2
5. Verify:
   - User 1 sees ONLY Product A, Customer 1, Sale 1
   - User 2 sees ONLY Product B, Customer 2, Sale 2
   - Direct API calls to other store's data return 0 results

## Progress Tracking

- **Services Updated**: 2/18 (ProductService, SaleService)
- **Controllers Updated**: 2/18 (ProductController, SaleController)
- **Frontend Services Migrated**: 0/14

Total % Complete: ~5%

---

**Last Updated**: 2026-02-05
**Target Completion**: When all services show ✅
