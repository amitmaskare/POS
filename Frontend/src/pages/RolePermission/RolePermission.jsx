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
import { useTheme } from "@mui/material/styles";
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

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          background: isDark ? "#1b263b" : "#fff"
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ManageAccountsIcon sx={{ color: isDark ? "#fff" : "#415a77", }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: isDark ? "#fff" : "#415a77", }}>
            Role Permissions
          </Typography>
        </Box>

        <FormControl
  fullWidth
  size="small"
  sx={{
    "& .MuiOutlinedInput-root": {
      color: isDark ? "#fff" : "#415a77",

      "& fieldset": {
        borderColor: isDark ? "#fff" : "#415a77",
      },

      "&:hover fieldset": {
        borderColor: isDark ? "#fff" : "#415a77",
      },

      "&.Mui-focused fieldset": {
        borderColor: isDark ? "#fff" : "#415a77",
      },
    },

    "& .MuiSvgIcon-root": {
      color: isDark ? "#fff" : "#415a77",
    },
  }}
>
  <InputLabel
    sx={{
      color: isDark ? "#fff" : "#415a77",
      "&.Mui-focused": {
        color: isDark ? "#fff" : "#415a77",
      },
    }}
  >
    Select Role
  </InputLabel>

  <Select
    value={selectedRole}
    label="Select Role"
    onChange={(e) => setSelectedRole(e.target.value)}
    sx={{
      backgroundColor: isDark ? "#1b263b" : "#fff",
      borderRadius: 2,
      color: isDark ? "#fff" : "#415a77",
    }}
  >

            {roles.map((role) => {
              const icon =
                role.name.toLowerCase() === "admin" ? (
                  <AdminPanelSettingsIcon fontSize="small" color="info" />
                ) : role.name.toLowerCase() === "manager" ? (
                  <WorkIcon fontSize="small" color="success" />
                ) : (
                  <PersonIcon fontSize="small" color="warning" />
                );

              return (
                <MenuItem
                  key={role.roleId}
                  value={role.roleId}
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderRadius: 2,
                    mx: 1,
                    my: 0.3,

                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {icon}

                    <Typography
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 500
                      }}
                    >
                      {role.name}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
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
                <Typography variant="h6" fontWeight={600} sx={{ color: isDark ? "#fff" : "#415a77" }}>
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
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "#415A77",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              >
                                {perm.action}
                              </Typography>
                              <Switch
                                size="small"
                                checked={selectedPermissions.has(perm.permissionId)}
                                onChange={() => handleTogglePermission(perm.permissionId)}
                                sx={{
                                  "& .MuiSwitch-switchBase": {
                                    color: "#9CA3AF", // thumb color when unchecked
                                  },
                                  "& .MuiSwitch-track": {
                                    backgroundColor: "#D1D5DB", // track color when unchecked
                                    opacity: 1,
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "#415A77",
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: "#415A77",
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
          elevation={3}
          sx={{
            p: 6,
            mt: 3,
            textAlign: "center",
            backgroundColor: isDark ? "#1b263b" : "#fff",
            borderRadius: 3,
            border: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: "#e3f2fd",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <AssignmentIcon sx={{ fontSize: 32, color: "#415a77" }} />
          </Box>

          <Typography variant="h6" fontWeight={600} sx={{color:isDark ? "#fff" : "#415a77"}}>
            No Role Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
            Please select a role from the dropdown above to manage permissions.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
