import React from "react";
import { Box, Stack, Button, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const SearchFilter = ({
  placeholder = "Search Barcode...",
  onSearchChange = () => {},
  value = "",
  buttons = [],
  extraFields = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ borderRadius: 2, width: "90%",mt:2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={placeholder}
          onChange={onSearchChange}
          value={value}
            sx={{
              bgcolor: isDark ? "#1b263b" : "#fff",
              input: {
                color: isDark ? "#fff" : "#415a77",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#fff" : "#415a77",
              },
            }}
          />
        </Box>
        
        {buttons.length > 0 && (
          <Stack direction="row" spacing={1}>
            {buttons.map((btn, index) => (
              <Button
                key={index}
                variant={btn.variant || "outlined"}
                startIcon={btn.icon || null}
                onClick={btn.onClick || (() => {})}
                sx={{
                  borderColor: isDark ? "#fff" : "#415a77",
                  color: isDark ? "#fff" : "#415a77",
                  height: 40,
                  ...btn.sx,
                }}
              >
                {btn.label}
              </Button>
            ))}
          </Stack>
        )}
        {/* EXTRA FIELDS */}
        {extraFields.length > 0 &&
          extraFields.map((field, index) => <Box key={index}>{field}</Box>)}
      </Stack>
    </Box>
  );
};

export default SearchFilter;
