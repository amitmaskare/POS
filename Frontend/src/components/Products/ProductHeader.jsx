import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { FaRegSquarePlus } from "react-icons/fa6";

const Header = ({ onAddClick }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Box>
      <Typography variant="h4" fontWeight="bold" color="#5A8DEE">
        Products
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Manage your product inventory
      </Typography>
    </Box>
    <Button
      variant="contained"
      startIcon={<FaRegSquarePlus />}
      sx={{ bgcolor: "#5A8DEE", "&:hover": { bgcolor: "#5A8DEE" } }}
      onClick={onAddClick}
    >
      Add Product
    </Button>
  </Stack>
);

export default Header;