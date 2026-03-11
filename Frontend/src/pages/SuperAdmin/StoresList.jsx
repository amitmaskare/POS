import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';

const StoresList = ({ onEditCounterLimit, refreshTrigger }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

      const response = await axios.get(
        `${apiUrl}/api/superadmin/stores`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status) {
        setStores(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch stores');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [refreshTrigger]);

  const getUsageColor = (current, limit) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            All Stores ({stores.length})
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchStores} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {stores.length === 0 ? (
          <Alert severity="info">
            No stores found. Create your first store admin to get started.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Store ID</strong></TableCell>
                  <TableCell><strong>Store Name</strong></TableCell>
                  <TableCell><strong>Admin</strong></TableCell>
                  <TableCell><strong>Contact</strong></TableCell>
                  <TableCell><strong>Counter Usage</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.store_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {store.store_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {store.store_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {store.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {store.admin_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {store.admin_login_id}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {store.admin_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {store.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${store.counter_count || 0} / ${store.counter_limit}`}
                          color={getUsageColor(store.counter_count || 0, store.counter_limit)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {store.counter_count >= store.counter_limit ? '(Full)' : `(${store.counter_limit - (store.counter_count || 0)} available)`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Update Counter Limit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditCounterLimit(store)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StoresList;
