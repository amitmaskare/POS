import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import { Save, CheckCircle, ContentCopy } from "@mui/icons-material";
import {useParams, useNavigate} from "react-router-dom";
import Title from "../../components/MainContentComponents/Title";
import { userList } from "../../services/userService";
import { roleList } from "../../services/RoleService";
import {
  getAllPermissionsGrouped,
  getUserPermissions,
  updateUserPermissions,
  copyRolePermissionsToUser,
} from "../../services/UserPermissionService";

export default function UserPermissions() {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(routeUserId || "");
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch users and permissions on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  // Fetch user permissions when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserPermissions(selectedUser);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const result = await userList();
      if (result.status) {
        setUsers(result.data);
        // Find selected user data
        if (routeUserId) {
          const userData = result.data.find(u => u.userId.toString() === routeUserId);
          setSelectedUserData(userData);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const result = await roleList();
      if (result.status) {
        setRoles(result.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const result = await getAllPermissionsGrouped();
      if (result.status) {
        setPermissions(result.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      setLoading(true);
      const result = await getUserPermissions(userId);
      if (result.status) {
        // Create a set of permission IDs that this user has
        const permIds = new Set(result.data.map((up) => up.permission_id));
        setSelectedPermissions(permIds);
      }
    } catch (error) {
      // User might not have custom permissions yet, that's okay
      setSelectedPermissions(new Set());
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    const userData = users.find(u => u.userId.toString() === userId);
    setSelectedUserData(userData);
    // Clear previous selections
    setSelectedPermissions(new Set());
    setSuccess("");
    setError("");
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleToggleModule = (modulePermissions) => {
    const modulePermIds = modulePermissions.map((p) => p.permissionId);
    const allSelected = modulePermIds.every((id) =>
      selectedPermissions.has(id)
    );

    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all
        modulePermIds.forEach((id) => newSet.delete(id));
      } else {
        // Select all
        modulePermIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleCopyFromRole = async () => {
    if (!selectedUser || !selectedUserData) {
      setError("Please select a user");
      return;
    }

    setSuccess("");
    setError("");

    try {
      const result = await copyRolePermissionsToUser(selectedUser, selectedUserData.role);
      if (result.status) {
        setSuccess("Role permissions copied successfully!");
        // Refresh user permissions
        await fetchUserPermissions(selectedUser);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) {
      setError("Please select a user");
      return;
    }

    setSuccess("");
    setError("");
    setSaving(true);

    try {
      const permissionArray = Array.from(selectedPermissions);
      const result = await updateUserPermissions(selectedUser, permissionArray);

      if (result.status) {
        setSuccess(result.message);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 4 }}>
      <Title
        title="User Permission Management"
        subtitle="Assign custom permissions to individual users"
      />

      {/* User Selection */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                label="Select User"
                onChange={(e) => handleUserChange(e.target.value)}
                sx={{ backgroundColor: "#fff" }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.name} ({user.email}) - Role: {user.role === 1 ? 'Admin' : roles.find(r => r.roleId === user.role)?.name || 'Unknown'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {selectedUser && selectedUserData && (
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ContentCopy />}
                onClick={handleCopyFromRole}
                sx={{
                  borderColor: "#5A8DEE",
                  color: "#5A8DEE",
                  "&:hover": {
                    borderColor: "#4a7dd9",
                    backgroundColor: "#f0f4ff",
                  },
                }}
              >
                Copy from Role
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Permissions Grid */}
      {selectedUser && (
        <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600} color="#5A8DEE">
                    Custom Permissions for {selectedUserData?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    User-specific permissions override role permissions
                  </Typography>
                </Box>
                <Chip
                  label={`${selectedPermissions.size} permissions selected`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {permissions.map((module) => {
                  const modulePermIds = module.permissions.map(
                    (p) => p.permissionId
                  );
                  const allSelected = modulePermIds.every((id) =>
                    selectedPermissions.has(id)
                  );
                  const someSelected =
                    !allSelected &&
                    modulePermIds.some((id) => selectedPermissions.has(id));

                  return (
                    <Grid item xs={12} md={6} lg={4} key={module.module}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2.5,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: 3,
                            borderColor: "#5A8DEE",
                          },
                        }}
                      >
                        {/* Module Header with Master Toggle */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            color="#333"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {module.moduleName}
                          </Typography>
                          <Switch
                            checked={allSelected}
                            onChange={() =>
                              handleToggleModule(module.permissions)
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#5A8DEE",
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: "#5A8DEE",
                                },
                            }}
                          />
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        {/* Individual Permissions */}
                        {module.permissions.map((perm) => (
                          <Box
                            key={perm.permissionId}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              py: 1,
                              px: 1.5,
                              borderRadius: 1,
                              transition: "background-color 0.2s",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: "13px",
                                textTransform: "capitalize",
                              }}
                            >
                              {perm.action}
                            </Typography>
                            <Switch
                              size="small"
                              checked={selectedPermissions.has(
                                perm.permissionId
                              )}
                              onChange={() =>
                                handleTogglePermission(perm.permissionId)
                              }
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: "#4CAF50",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor: "#4CAF50",
                                  },
                              }}
                            />
                          </Box>
                        ))}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Save Button */}
              <Box mt={4} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    backgroundColor: "#5A8DEE",
                    px: 5,
                    py: 1.5,
                    fontSize: "16px",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#4a7dd9",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Save User Permissions"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Empty State */}
      {!selectedUser && !loading && (
        <Paper
          elevation={1}
          sx={{
            p: 6,
            mt: 3,
            textAlign: "center",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No User Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a user from the dropdown above to manage their custom permissions
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
