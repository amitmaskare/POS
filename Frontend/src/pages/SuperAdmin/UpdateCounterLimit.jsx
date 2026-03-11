import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const UpdateCounterLimit = ({ open, handleClose, store, onSuccess }) => {
  const [counterLimit, setCounterLimit] = useState(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (store) {
      setCounterLimit(store.counter_limit || 5);
    }
  }, [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (counterLimit < 1 || counterLimit > 100) {
      setError('Counter limit must be between 1 and 100');
      return;
    }

    if (counterLimit < (store?.counter_count || 0)) {
      setError(`Cannot set limit below current counter count (${store.counter_count}). Please remove some counter users first.`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

      const response = await axios.post(
        `${apiUrl}/api/superadmin/update-counter-limit`,
        {
          store_id: store.store_id,
          counter_limit: parseInt(counterLimit)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        setSuccess('Counter limit updated successfully!');

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          handleClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update counter limit');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating counter limit');
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Update Counter Limit
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Store: <strong>{store.store_name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Store ID: <strong>{store.store_id}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current Usage:
            <Chip
              label={`${store.counter_count || 0} / ${store.counter_limit}`}
              size="small"
              sx={{ ml: 1 }}
              color={store.counter_count >= store.counter_limit ? 'error' : 'success'}
            />
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Counter Limit"
            type="number"
            value={counterLimit}
            onChange={(e) => setCounterLimit(e.target.value)}
            required
            inputProps={{ min: store.counter_count || 1, max: 100 }}
            helperText={`Set the maximum number of counter users (minimum: ${store.counter_count || 1}, maximum: 100)`}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Limit'}
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
        </form>
      </Box>
    </Modal>
  );
};

export default UpdateCounterLimit;
