import React from "react";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Stats = ({ stats = [] }) => {

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <Grid
      container
      spacing={3}
      alignItems="stretch"
      sx={{
        justifyContent: {
          xs: "center",
          sm: "center",
          md: "space-between"
        }
      }}
    >
      {safeStats.map((card, index) => {
        if (!card) return null;

        return (
          <Grid
            item
            xs={6}
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
                  xs: 177,
                  sm: 255,
                  md: 255,
                },
                maxWidth: 280,
                borderRadius: 3,
                height: "100%",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                transition: "0.3s ease",
                bgcolor: isDark ? "#1b263b" : "#ffffff",

                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
                }
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
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: isDark ? "#ffffff" : "#415A77"
                    }}
                  >
                    {card?.title || "N/A"}
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={card?.color || "inherit"}
                  >
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