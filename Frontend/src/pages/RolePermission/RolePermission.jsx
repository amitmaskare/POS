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
import { Save, CheckCircle } from "@mui/icons-material";
import Title from "../../components/MainContentComponents/Title";
import { roleList } from "../../services/RoleService";
import {
  getAllPermissionsGrouped,
  getById,
  updateRolePermissions,
} from "../../services/RolePermissionService";

export default function RolePermission() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Fetch role permissions when role is selected
  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

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

  const fetchRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const result = await getById(roleId);
      if (result.status) {
        setRolePermissions(result.data);
        // Create a set of permission IDs that this role has
        const permIds = new Set(result.data.map((rp) => rp.permission_id));
        setSelectedPermissions(permIds);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setSuccess("");
    setError("");
    setSaving(true);

    try {
      const permissionArray = Array.from(selectedPermissions);
      const result = await updateRolePermissions(selectedRole, permissionArray);

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
        title="Role Permission Management"
        subtitle="Assign permissions to roles with toggle switches"
      />

      {/* Role Selection */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select Role</InputLabel>
          <Select
            value={selectedRole}
            label="Select Role"
            onChange={(e) => setSelectedRole(e.target.value)}
            sx={{ backgroundColor: "#fff" }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.roleId} value={role.roleId}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
      {selectedRole && (
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
                <Typography variant="h6" fontWeight={600} color="#5A8DEE">
                  Module Permissions
                </Typography>
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
                            indeterminate={someSelected}
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
                  {saving ? "Saving..." : "Save Permissions"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Empty State */}
      {!selectedRole && !loading && (
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
            No Role Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a role from the dropdown above to manage permissions
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
