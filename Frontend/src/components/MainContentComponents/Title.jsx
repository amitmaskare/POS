import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";

const Title = ({
  title,
  subtitle,
  actions = [], // NEW
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    {/* Left section */}
    <Box>
      <Typography variant="h4" fontWeight="bold" color="#5A8DEE">
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.dark">
        {subtitle}
      </Typography>
    </Box>

    {/* Right buttons */}
    <Stack direction="row" spacing={2}>
      {actions.map((btn, idx) => (
        <Button
          key={idx}
          variant={btn.variant || "contained"}
          startIcon={btn.icon}
          onClick={btn.onClick}
          sx={{
            bgcolor: btn.bgcolor || "inherit",
            color: btn.variant === "outlined" ? "#5A8DEE" : "white",
            "&:hover": {
              bgcolor: btn.bgcolor || (btn.variant === "outlined" ? "inherit" : undefined),
            },
          }}
        >
          {btn.label}
        </Button>
      ))}
    </Stack>
  </Stack>
);

export default Title;
