import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

// Get all settings as array
export const getSettingsList = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${apiUrl}/settings/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all settings as key-value object
export const getAllSettings = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${apiUrl}/settings/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single setting by key
export const getSettingByKey = async (key) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${apiUrl}/settings/get/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update or insert a single setting
export const upsertSetting = async (key, value) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${apiUrl}/settings/upsert`,
      { key, value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk update multiple settings
export const bulkUpdateSettings = async (settings) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${apiUrl}/settings/bulkUpdate`,
      { settings },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a setting
export const deleteSetting = async (key) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${apiUrl}/settings/delete/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get settings by category
export const getSettingsByCategory = async (category) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${apiUrl}/settings/category/${category}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
