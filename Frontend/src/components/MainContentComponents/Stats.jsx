import React from "react";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";

const Stats = ({ stats = [] }) => {
  return (
    <Grid container spacing={3} justifyContent="space-between" alignItems="stretch">
      {stats.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              height: "100%",
              transition: "0.3s ease",
              "&:hover": { transform: "translateY(-5px)" },
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
                {card.icon}
              </Box>

              {/* Text */}
              <Box>
                <Typography variant="subtitle1" color="text.dark">
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={card.color}>
                  {card.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Stats;
