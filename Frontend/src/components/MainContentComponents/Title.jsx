import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Title = ({ title, subtitle, actions = [] }) => {

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Stack
      sx={{
        flexDirection: "row",
        justifyContent: "space-between",


      }}
    >
      {/* Left section */}
      <Box>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: isDark ? "#fff" : "#415a77"
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            color: isDark ? "#d1d5db" : "#415a77"
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Buttons */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          "@media (max-width:550px)": {

            justifyContent: "center",
            alignItems: "center",


          }
        }}
      >
        {actions.map((btn, idx) => (
          <Button
            key={idx}
            variant={btn.variant || "contained"}
            startIcon={btn.icon}
            onClick={btn.onClick}
            sx={{
              bgcolor: "#415a77",
              color: "#fff",

              minWidth: { xs: 40, sm: "auto" },
              height: { xs: 40, sm: 34 },

              px: { xs: 0.8, sm: 1.8 },

              "& .MuiButton-startIcon": {
                marginRight: { xs: 0, sm: "6px" },
                marginLeft: 0,
              },


              borderRadius: { xs: "50%", sm: 2 },

              "&:hover": {
                bgcolor: "#344e64",
              },
            }}
          >
            {/* Hide text on mobile */}
            <Box sx={{ display: { xs: "none", sm: "inline" } }}>
              {btn.label}
            </Box>
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};

export default Title;