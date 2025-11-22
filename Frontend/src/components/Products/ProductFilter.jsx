import React from "react";
import { Box, Stack, Button, TextField } from "@mui/material";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from "react-icons/ai";

const SearchFilter = () => (
  <Box sx={{ p: 1, borderRadius: 2 }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", sm: "center" }}
    >
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search products or categories..."
        InputProps={{
          startAdornment: <IoSearch color="action" sx={{ mr: 1 }} />,
        }}
        sx={{ flex: 1, bgcolor: "#fff" }}
      />
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<CiFilter />}>
          Filter
        </Button>
        <Button variant="outlined" startIcon={<AiOutlineCloudDownload />}>
          Export
        </Button>
        <Button variant="outlined" startIcon={<AiOutlineCloudUpload />}>
          Import
        </Button>
      </Stack>
    </Stack>
  </Box>
);

export default SearchFilter;
