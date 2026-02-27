import React from "react";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";

const Stats = ({ stats = [] }) => {
  const safeStats = Array.isArray(stats) ? stats : [];
  
  return (
    <Grid
    container
    spacing={3}
    alignItems="stretch"
    sx={{
      justifyContent: {
        xs: "center",       // mobile
        sm: "center",
        md: "space-between" // desktop and above
      }
    }}
  >
      {safeStats.map((card, index) => {
        if (!card) return null; // Skip null/undefined cards
        
        return (
          <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Card
  sx={{
    width: {
      xs: 255,   // fixed width on mobile
      sm: 255,
      md: 255,
    },
    maxWidth: 280,
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              height: "100%",
              transition: "0.3s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 3,
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  
                  fontSize: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 70,
                }}
              >
                {card?.icon || ""}
              </Box>

              {/* Text */}
              <Box>
                <Typography variant="subtitle2" color="#415A77" sx={{ fontWeight: 900 }}>
                  {card?.title || "N/A"}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={card?.color || "inherit"}>
                  {card?.value || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      );
      })}
    </Grid>
  );
};

export default Stats;
