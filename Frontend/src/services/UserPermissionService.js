import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

// Helper function to get fresh token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Get user permissions
export const getUserPermissions = async (userId) => {
  try {
    const response = await axios.get(`${apiUrl}/userpermission/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all permissions grouped by module
export const getAllPermissionsGrouped = async () => {
  try {
    const response = await axios.get(`${apiUrl}/userpermission/permissions/grouped`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user permissions
export const updateUserPermissions = async (userId, permissionIds) => {
  try {
    const response = await axios.post(
      `${apiUrl}/userpermission/update`,
      { userId, permissionIds },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Copy role permissions to user
export const copyRolePermissionsToUser = async (userId, roleId) => {
  try {
    const response = await axios.post(
      `${apiUrl}/userpermission/copy-from-role`,
      { userId, roleId },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if user has custom permissions
export const hasCustomPermissions = async (userId) => {
  try {
    const response = await axios.get(`${apiUrl}/userpermission/has-custom/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
