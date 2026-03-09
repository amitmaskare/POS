import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL
const token = localStorage.getItem("token");

/**
 * Scan for available serial ports
 */
export const scanPorts = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/pos/scan-ports`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Connect to POS device
 */
export const connectDevice = async (data) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${apiUrl}/pos/connect`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Disconnect from POS device
 */
export const disconnectDevice = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${apiUrl}/pos/disconnect`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get device status
 */
export const getDeviceStatus = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/pos/status`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Process payment through POS device
 */
export const processPayment = async (data) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${apiUrl}/pos/process-payment`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Cancel transaction
 */
export const cancelTransaction = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${apiUrl}/pos/cancel-transaction`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get last transaction
 */
export const getLastTransaction = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/pos/last-transaction`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get POS configuration
 */
export const getConfig = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/pos/config`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (limit = 50, offset = 0) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/pos/transactions?limit=${limit}&offset=${offset}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};
