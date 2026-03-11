import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const CreateStoreAdmin = ({ open, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    counter_limit: 5,
    store_name: '',
    phone: '',
    address: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'counter_limit' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.store_name) {
      setError('Name, Email, Password, and Store Name are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.counter_limit < 1 || formData.counter_limit > 100) {
      setError('Counter limit must be between 1 and 100');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

      const response = await axios.post(
        `${apiUrl}/api/superadmin/create-store-admin`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        setSuccess(`Store Admin created successfully! User ID: ${response.data.data.user_id}, Store ID: ${response.data.data.store_id}`);

        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          counter_limit: 5,
          store_name: '',
          phone: '',
          address: ''
        });

        // Call success callback
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(response.data.data);
            handleClose();
          }, 2000);
        }
      } else {
        setError(response.data.message || 'Failed to create Store Admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error creating Store Admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h5" component="h2" gutterBottom>
          Create Store Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Create a new store administrator who can manage their store and create counter users
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Admin Information */}
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
              Admin Information
            </Typography>

            <TextField
              fullWidth
              label="Admin Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              size="small"
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              size="small"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              size="small"
              helperText="Minimum 6 characters"
            />

            {/* Store Information */}
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
              Store Information
            </Typography>

            <TextField
              fullWidth
              label="Store Name"
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              required
              size="small"
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              size="small"
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
              size="small"
            />

            {/* Counter Limit */}
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
              Counter User Limit
            </Typography>

            <TextField
              fullWidth
              label="Maximum Counter Users"
              name="counter_limit"
              type="number"
              value={formData.counter_limit}
              onChange={handleChange}
              required
              size="small"
              inputProps={{ min: 1, max: 100 }}
              helperText="Maximum number of cashier/counter users this store admin can create (1-100)"
            />

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Store Admin'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateStoreAdmin;
