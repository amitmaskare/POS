# Role-Based Permission System Documentation

## Overview
Complete module-wise granular permission system with toggle-switch UI for managing role permissions in the POS system.

## Features Implemented

### 1. Comprehensive Permission Structure
- **76 permissions** across **16 modules**
- **Granular actions** for each module:
  - `view` - View module data
  - `add` - Create new records
  - `edit` - Modify existing records
  - `delete` - Remove records
  - `list` - List/search records

### 2. Modules with Permissions
1. **POS System** - view, add, edit, delete, list
2. **Products** - view, add, edit, delete, list
3. **Purchases** - view, add, edit, delete, list
4. **Receiving** - view, add, edit, delete, list
5. **Sales** - view, add, edit, delete, list
6. **Return Product** - view, add, edit, delete, list
7. **Transactions** - view, add, edit, delete, list
8. **Inventory** - view, add, edit, delete, list
9. **Reports** - view, export, list
10. **Customers** - view, add, edit, delete, list
11. **Users** - view, add, edit, delete, list
12. **Ration Cards** - view, add, edit, delete, list
13. **Offers** - view, add, edit, delete, list
14. **Role** - view, add, edit, delete, list
15. **Permission** - view, add, edit, delete, list
16. **Role Permission** - view, manage, list

## Database Schema

### Tables Used
```sql
-- Roles table (existing)
roles (roleId, name, created_at)

-- Permissions table (existing)
permissions (permissionId, name, slug_url, created_at)

-- Role Permissions junction table (existing)
role_permissions (id, role_id, permission_id, updated_at)

-- Users table (existing)
users (userId, user_id, name, email, password, role, created_at)
```

### Permission Naming Convention
- **Format**: `{action}-{module}`
- **Examples**:
  - `view-product` - View products
  - `add-sale` - Add new sale
  - `delete-customer` - Delete customer
  - `list-inventory` - List inventory items

## Backend Implementation

### 1. Services
**File**: `/src/services/RolePermissionService.js`

**New Methods**:
```javascript
// Get all permissions grouped by module
getAllPermissionsGrouped()

// Get permissions for a specific role
getById(role_id)

// Update role permissions (replaces all)
updateRolePermissions(role_id, permission_ids)
```

### 2. Controllers
**File**: `/src/controllers/RolePermissionController.js`

**New Endpoints**:
```javascript
// GET /rolepermission/permissions-grouped
getAllPermissionsGrouped()

// GET /rolepermission/getById/:id
getById()

// POST /rolepermission/update
updateRolePermissions()
```

### 3. Routes
**File**: `/src/routes/RolePermissionRoute.js`

```javascript
GET  /rolepermission/list
GET  /rolepermission/permissions-grouped
GET  /rolepermission/getById/:id
POST /rolepermission/giveRolePermission
POST /rolepermission/update
```

### 4. Authentication Integration
**File**: `/src/services/AuthService.js`

**Login Flow**:
- Admin (role_id=1) → Gets ALL permissions
- Other roles → Get permissions from `role_permissions` table
- Permissions stored in JWT token and localStorage

```javascript
// JWT payload structure
{
  userId: 1,
  email: "user@example.com",
  name: "User Name",
  role: "manager",  // role name
  permissions: ["view-product", "add-product", ...]  // slug_urls
}
```

## Frontend Implementation

### 1. Services
**File**: `/src/services/RolePermissionService.js`

**API Methods**:
```javascript
rolePermissionList()              // List all role permissions
getAllPermissionsGrouped()         // Get permissions grouped by module
getById(id)                        // Get permissions for a role
updateRolePermissions(role_id, permission_ids)  // Update role permissions
```

### 2. Role Permission Page
**File**: `/src/pages/RolePermission/RolePermission.jsx`

**Features**:
- Role selection dropdown
- Module-wise permission cards
- Toggle switches for each permission
- Master toggle for entire module
- Permission counter chip
- Save button with loading state
- Success/Error alerts

**UI Components**:
- **Role Dropdown** - Select which role to manage
- **Module Cards** (Grid 3 columns on desktop)
  - Module name header
  - Master toggle switch (enables/disables all permissions in module)
  - Individual permission toggles
- **Save Button** - Centered, large, with loading spinner

### 3. Sidebar Permission Filtering
**File**: `/src/layouts/Sidebar.jsx` (Line 76-78)

```javascript
const user = getUser();
const visibleMenus = menuItems.filter(menu =>
  user.role === "admin" || user.permissions.includes(menu.permission)
);
```

## Permission Seeding

### Script
**File**: `/Backend/seedPermissions.js`

**Usage**:
```bash
cd Backend
node seedPermissions.js
```

**Output**:
- Inserts 76 permissions
- Skips duplicates
- Shows success/skip status for each
- Displays total count

## How It Works

### 1. Admin Creates Role
1. Go to **Role** page
2. Click "Add Role"
3. Enter role name (e.g., "Manager", "Cashier")
4. Save

### 2. Admin Assigns Permissions to Role
1. Go to **Role Permission** page
2. Select role from dropdown
3. Toggle permissions ON/OFF for each module
4. Click "Save Permissions"

### 3. Admin Creates User with Role
1. Go to **Users** page
2. Click "Add User"
3. Enter user details
4. **Select role** from dropdown
5. Save

### 4. User Logs In
1. User logs in with credentials
2. Backend fetches role permissions
3. JWT token includes:
   - Role name
   - Array of permission slug_urls
4. Frontend stores in localStorage
5. Sidebar shows only allowed menus
6. Protected routes check permissions

### 5. Permission Check Flow
```
User Login
  ↓
Fetch User Role
  ↓
Query role_permissions table
  ↓
Get all permission slug_urls
  ↓
Store in JWT + localStorage
  ↓
Frontend filters menus
  ↓
Backend middleware checks permissions
```

## Example Scenarios

### Scenario 1: Cashier Role
**Permissions**:
- view-pos, add-pos (can use POS system)
- view-product, list-product (can view products)
- view-customer (can view customers)

**Result**:
- Sidebar shows: POS System, Products, Customers
- Can make sales but can't edit products
- Can't access Users, Reports, etc.

### Scenario 2: Manager Role
**Permissions**:
- All permissions for Products, Sales, Customers
- view-reports, export-reports
- view-inventory, edit-inventory

**Result**:
- Can manage daily operations
- Can view and export reports
- Can adjust inventory
- Can't create users or manage roles

### Scenario 3: Admin Role
**Permissions**: ALL (automatic)

**Result**:
- Full access to everything
- Can manage users and roles
- Can assign permissions

## API Testing

### Get All Permissions Grouped
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/rolepermission/permissions-grouped
```

### Get Role Permissions
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/rolepermission/getById/2
```

### Update Role Permissions
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"role_id": 2, "permission_ids": [1, 2, 3, 6, 7]}' \
  http://localhost:4000/rolepermission/update
```

## Frontend Usage

### Check if User has Permission
```javascript
import { getUser } from '../utils/Auth';

const user = getUser();

// Check if user is admin
if (user.role === 'admin') {
  // Full access
}

// Check specific permission
if (user.permissions.includes('add-product')) {
  // Show add product button
}

// Check multiple permissions
const canManageProducts = ['view-product', 'add-product', 'edit-product']
  .every(perm => user.permissions.includes(perm));
```

### Protected Component Example
```javascript
function ProductActions() {
  const user = getUser();

  return (
    <Box>
      {user.permissions.includes('add-product') && (
        <Button>Add Product</Button>
      )}
      {user.permissions.includes('edit-product') && (
        <Button>Edit Product</Button>
      )}
      {user.permissions.includes('delete-product') && (
        <Button>Delete Product</Button>
      )}
    </Box>
  );
}
```

## Security Considerations

### Frontend
- Permissions stored in localStorage (user object)
- Menus filtered based on permissions
- Conditional rendering of action buttons

### Backend
- JWT token contains permissions
- Middleware checks permissions on protected routes
- Admin role bypasses permission checks
- Transaction-based permission updates

### Best Practices
1. **Never trust frontend** - Always validate permissions on backend
2. **Use middleware** - Add permission checks to all protected routes
3. **Audit trail** - Log permission changes
4. **Regular review** - Periodically review role permissions
5. **Principle of least privilege** - Give minimum required permissions

## Troubleshooting

### Permissions Not Showing
- Check if role has permissions assigned
- Verify JWT token contains permissions
- Check localStorage for user object
- Ensure sidebar menuItems have correct permission strings

### Permission Denied Errors
- Verify user's role has the required permission
- Check if permission slug_url matches exactly
- Ensure admin check is working (role === "admin")

### Toggle Not Working
- Check browser console for errors
- Verify API endpoint is responding
- Check role_id is being passed correctly
- Ensure permissions array is formatted correctly

## Future Enhancements

1. **Permission Groups** - Group related permissions
2. **Custom Permissions** - Create custom permissions dynamically
3. **Permission Templates** - Predefined permission sets
4. **Activity Log** - Track who changed what permissions
5. **Permission Expiry** - Time-limited permissions
6. **IP Restrictions** - Geo-based permission restrictions
7. **Bulk Updates** - Update permissions for multiple roles at once

## Files Modified/Created

### Backend
- ✅ `/Backend/seedPermissions.js` - Permission seeding script
- ✅ `/Backend/permissions_seed.sql` - SQL file with all permissions
- ✅ `/Backend/src/services/RolePermissionService.js` - Updated with new methods
- ✅ `/Backend/src/controllers/RolePermissionController.js` - New endpoints
- ✅ `/Backend/src/routes/RolePermissionRoute.js` - New routes
- ✅ `/Backend/src/services/AuthService.js` - Permission loading in login

### Frontend
- ✅ `/Frontend/src/services/RolePermissionService.js` - New API calls
- ✅ `/Frontend/src/pages/RolePermission/RolePermission.jsx` - Complete rewrite with toggle UI
- ✅ `/Frontend/src/layouts/Sidebar.jsx` - Already filtering by permissions

## Summary

This implementation provides a **complete, production-ready role-based permission system** with:
- ✅ 76 granular permissions across 16 modules
- ✅ Beautiful toggle-switch UI
- ✅ Module-wise permission management
- ✅ Automatic admin bypass
- ✅ JWT-based authentication
- ✅ Frontend menu filtering
- ✅ Backend permission validation
- ✅ Easy-to-use permission assignment interface

The system allows you to create different user roles (Manager, Cashier, Supervisor, etc.) and give each role specific permissions, controlling exactly what they can see and do in the system!
