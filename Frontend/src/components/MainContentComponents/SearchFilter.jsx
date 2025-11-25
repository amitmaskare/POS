import React from "react";
import { Box, Stack, Button, TextField, InputAdornment } from "@mui/material";
import { IoSearch } from "react-icons/io5";

const SearchFilter = ({
  placeholder = "Search...",
  onSearchChange = () => {},
  buttons = [],
  extraFields = [], // <-- NEW: Dynamic extra form elements
}) => {
  return (
    <Box sx={{ p: 1, borderRadius: 2, width: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        {/* Search Field */}
        <TextField
          variant="outlined"
          size="small"
          placeholder={placeholder}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, bgcolor: "#fff" }}
        />

        {/* Extra Fields (e.g., Select Dropdown) */}
        {extraFields.length > 0 &&
          extraFields.map((field, index) => <Box key={index}>{field}</Box>)}

        {/* Dynamic Buttons */}
        {buttons.length > 0 && (
          <Stack direction="row" spacing={1}>
            {buttons.map((btn, index) => (
              <Button
                key={index}
                variant={btn.variant || "outlined"}
                startIcon={btn.icon || null}
                onClick={btn.onClick || (() => {})}
                sx={btn.sx || {}}
              >
                {btn.label}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default SearchFilter;
