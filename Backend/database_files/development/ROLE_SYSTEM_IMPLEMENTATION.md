# Role-Based Access Control Implementation

## Overview
This document describes the complete role-based system with proper user filtering and device management.

## Role Hierarchy

```
Super Admin (role=0)
  └── Can create Store Admins
      └── Store Admin (role=1)
          ├── Can create Sub-Admins (role=1, same store)
          └── Can create Cashiers (role=2)
```

## User Visibility Rules

### Super Admin (role=0)
- **Sees**: ALL users in the system (admins and cashiers from all stores)
- **Cannot see**: Nothing hidden from super admin
- **Can create**: Store Admins with new stores

### Store Admin (role=1)
- **Sees**: Only users from their own store (sub-admins + cashiers)
- **Cannot see**: Super Admin (role=0) or users from other stores
- **Can create**:
  - Sub-Admins (role=1) for the same store
  - Cashiers (role=2) for the same store

### Cashier (role=2)
- **Sees**: No access to user list
- **Cannot see**: Any users
- **Can create**: Nothing

## Database Changes

### New Column: `created_by`
- Added to `users` table
- Tracks which user created this user
- Used for audit trail and hierarchy tracking

### Migration SQL
File: `database_files/development/update_user_filtering.sql`

```sql
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `created_by` INT(11) DEFAULT NULL;

ADD INDEX IF NOT EXISTS `idx_store_role` (`store_id`, `role`);
ADD INDEX IF NOT EXISTS `idx_created_by` (`created_by`);
```

## API Endpoints

### User List - `/user/list` (GET)
**Filtering Logic**:
- Super Admin: Returns ALL users
- Store Admin: Returns only users where `store_id = admin's store_id AND role != 0`
- Others: Returns empty array

**Response includes**:
- Basic user info (name, email, role)
- Device info (device_id, device_locked, first_login_at, last_login_at)
- Store info (store_name, counter_limit, counter_count)

### Create Sub-Admin - `/admin/create-sub-admin` (POST)
**Access**: Store Admin only
**Request Body**:
```json
{
  "name": "Sub Admin Name",
  "email": "subadmin@example.com",
  "password": "password123"
}
```

**Logic**:
- Creates user with `role=1`
- Sets `store_id` to admin's store
- Sets `created_by` to admin's userId
- No device binding required

### Unbind Device - `/admin/unbind-device` (POST)
**Access**: Store Admin only
**Request Body**:
```json
{
  "userId": 123
}
```

**Logic**:
- Verifies user belongs to admin's store
- Sets `device_id = NULL`, `device_locked = 0`
- Invalidates active sessions (logs out user immediately)
- User can login from new device on next attempt

## Frontend Changes

### Users Table Columns
1. **Name** - User full name
2. **Email** - User email
3. **Role** - Display name (Super Admin/Store Admin/Cashier)
4. **Store / Counter Limit** - Shows store name and counter usage for admins
5. **Device Status** - Shows device binding status for cashiers:
   - "Device Locked" (green chip with lock icon) - Device is bound
   - "Not Bound" (gray chip with unlock icon) - No device bound
6. **Created At** - User creation timestamp
7. **Actions** - Edit, Delete, Manage Permissions, Unbind Device (for locked cashiers)

### Device Status Display
- **Locked Cashiers**: Green chip with tooltip showing device ID
- **Unlocked Cashiers**: Gray chip indicating device not bound
- **Non-Cashiers**: Shows "-" (not applicable)

### Unbind Device Button
- Only visible for cashiers with `device_locked = 1`
- Shows confirmation dialog before unbinding
- Displays success/error message
- Refreshes user list after unbinding

## Testing Checklist

### 1. Super Admin Tests
- [ ] Login as super admin
- [ ] Verify can see ALL users in user list
- [ ] Verify can see admins from all stores
- [ ] Verify can see cashiers from all stores
- [ ] Create a new store admin
- [ ] Verify created_by is set to super admin's userId

### 2. Store Admin Tests
- [ ] Login as store admin
- [ ] Verify CANNOT see super admin in user list
- [ ] Verify can ONLY see users from own store
- [ ] Verify cannot see users from other stores
- [ ] Create a sub-admin for same store
- [ ] Verify sub-admin appears in user list
- [ ] Verify sub-admin has same store_id
- [ ] Create a cashier
- [ ] Verify cashier appears in user list
- [ ] View cashier device status (should show "Not Bound")

### 3. Sub-Admin Tests
- [ ] Login as sub-admin
- [ ] Verify can see same users as parent admin
- [ ] Verify CANNOT see super admin
- [ ] Verify can create cashiers for same store
- [ ] Verify can create more sub-admins for same store

### 4. Cashier Tests
- [ ] Login as cashier (first time) from Device A
- [ ] Verify device_id is captured and device_locked = 1
- [ ] Verify "Device Locked" chip shows in user list (when viewed by admin)
- [ ] Hover over chip to see device ID tooltip
- [ ] Try login from Device B - should fail
- [ ] Admin unbinds device
- [ ] Verify cashier is logged out immediately
- [ ] Verify "Not Bound" chip shows
- [ ] Login from Device B - should succeed and bind to Device B

### 5. Cross-Store Isolation Tests
- [ ] Create Store Admin A (Store1001)
- [ ] Create Store Admin B (Store1002)
- [ ] Admin A creates cashier for Store1001
- [ ] Login as Admin B
- [ ] Verify Admin B CANNOT see Admin A or their cashiers
- [ ] Verify Admin B can ONLY see Store1002 users

## Security Considerations

1. **Store Isolation**: Admins cannot access users from other stores
2. **Super Admin Hiding**: Regular admins cannot see super admin exists
3. **Device Binding**: Cashiers are locked to first login device for security
4. **Immediate Logout**: Device unbinding invalidates sessions immediately
5. **Created By Tracking**: Audit trail of who created each user
6. **JWT Token**: store_id embedded in token prevents tampering

## Common Issues & Solutions

### Issue: Admin can still see super admin
**Solution**: Check filter in `AuthService.userList()` - ensure `u.role != 0` condition exists

### Issue: Cashier shows "Not Bound" but is actually locked
**Solution**: Backend returns `device_locked` as integer (0 or 1), frontend checks `=== 1`

### Issue: Device unbind doesn't log out user
**Solution**: Verify `active_sessions` table update is executed in `unbindDevice()` method

### Issue: Sub-admin cannot see parent admin's cashiers
**Solution**: Both admins share same `store_id`, filter is by store, not by creator

## Migration Instructions

1. **Backup Database**
   ```bash
   mysqldump -u root -p pos_db > backup_$(date +%Y%m%d).sql
   ```

2. **Run Migration**
   ```bash
   mysql -u root -p pos_db < database_files/development/update_user_filtering.sql
   ```

3. **Verify Migration**
   ```sql
   DESC users;  -- Check created_by column exists
   SHOW INDEX FROM users WHERE Key_name IN ('idx_store_role', 'idx_created_by');
   ```

4. **Update Existing Data** (if needed)
   ```sql
   -- Link existing admins to super admin
   UPDATE users
   SET created_by = (SELECT userId FROM users WHERE role = 0 LIMIT 1)
   WHERE role = 1 AND created_by IS NULL;
   ```

5. **Restart Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```

6. **Clear Frontend Cache**
   - Clear browser localStorage
   - Hard refresh (Ctrl+Shift+R)
   - Re-login to get fresh JWT token

## API Response Examples

### Super Admin User List Response
```json
{
  "status": true,
  "message": "Fetch data successful",
  "data": [
    {
      "userId": 1,
      "user_id": 1000,
      "name": "Super Admin",
      "email": "super@admin.com",
      "role": 0,
      "roleName": "Super Admin",
      "store_id": null,
      "device_id": null,
      "device_locked": 0
    },
    {
      "userId": 2,
      "user_id": 1001,
      "name": "Store Admin 1",
      "email": "admin1@store.com",
      "role": 1,
      "roleName": "Store Admin",
      "store_id": "STORE1001",
      "store_name": "Main Store",
      "counter_limit": 5,
      "counter_count": 2,
      "device_id": null,
      "device_locked": 0
    },
    {
      "userId": 3,
      "user_id": 1002,
      "name": "Cashier 1",
      "email": "cashier1@store.com",
      "role": 2,
      "roleName": "Cashier",
      "store_id": "STORE1001",
      "store_name": "Main Store",
      "device_id": "AA:BB:CC:DD:EE:FF",
      "device_locked": 1,
      "first_login_at": "2025-01-15 10:30:00",
      "last_login_at": "2025-01-15 14:20:00"
    }
  ]
}
```

### Store Admin User List Response (for STORE1001)
```json
{
  "status": true,
  "message": "Fetch data successful",
  "data": [
    {
      "userId": 2,
      "user_id": 1001,
      "name": "Store Admin 1",
      "email": "admin1@store.com",
      "role": 1,
      "roleName": "Store Admin",
      "store_id": "STORE1001",
      "store_name": "Main Store",
      "counter_limit": 5,
      "counter_count": 2
    },
    {
      "userId": 4,
      "user_id": 1003,
      "name": "Sub Admin 1",
      "email": "subadmin1@store.com",
      "role": 1,
      "roleName": "Store Admin",
      "store_id": "STORE1001",
      "store_name": "Main Store"
    },
    {
      "userId": 3,
      "user_id": 1002,
      "name": "Cashier 1",
      "email": "cashier1@store.com",
      "role": 2,
      "roleName": "Cashier",
      "store_id": "STORE1001",
      "store_name": "Main Store",
      "device_id": "AA:BB:CC:DD:EE:FF",
      "device_locked": 1
    }
  ]
}
```

Note: Super Admin (userId 1) is NOT in the response when Store Admin queries the list.
