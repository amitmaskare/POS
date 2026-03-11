import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Store as StoreIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import CreateStoreAdmin from './CreateStoreAdmin';
import StoresList from './StoresList';
import UpdateCounterLimit from './UpdateCounterLimit';

const SuperAdmin = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenCreate = () => setOpenCreateModal(true);
  const handleCloseCreate = () => setOpenCreateModal(false);

  const handleOpenUpdate = (store) => {
    setSelectedStore(store);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdate = () => {
    setSelectedStore(null);
    setOpenUpdateModal(false);
  };

  const handleCreateSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdateSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Super Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all stores, store admins, and counter user limits
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          size="large"
        >
          Create Store Admin
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Stores
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    -
                  </Typography>
                </Box>
                <StoreIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Admins
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    -
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Counter Users
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    -
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Today
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    -
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stores List */}
      <StoresList
        onEditCounterLimit={handleOpenUpdate}
        refreshTrigger={refreshTrigger}
      />

      {/* Modals */}
      <CreateStoreAdmin
        open={openCreateModal}
        handleClose={handleCloseCreate}
        onSuccess={handleCreateSuccess}
      />

      <UpdateCounterLimit
        open={openUpdateModal}
        handleClose={handleCloseUpdate}
        store={selectedStore}
        onSuccess={handleUpdateSuccess}
      />
    </Container>
  );
};

export default SuperAdmin;
