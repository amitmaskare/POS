import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CloseIcon from "@mui/icons-material/Close";
const cardTypes = [
  {
    title: "APL",
    subtitle: "Above Poverty Line",
    icon: <HomeIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />,
    rice: "10 kg",
    wheat: "10 kg",
    sugar: "2 kg",
    kerosene: "5 L",
  },
  {
    title: "BPL",
    subtitle: "Below Poverty Line",
    icon: <ShieldIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />,
    rice: "15 kg",
    wheat: "15 kg",
    sugar: "3 kg",
    kerosene: "8 L",
  },
  {
    title: "AAY",
    subtitle: "Antyodaya Anna Yojana",
    icon: <PersonIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />,
    rice: "35 kg",
    wheat: "35 kg",
    sugar: "5 kg",
    kerosene: "10 L",
  },
  {
    title: "PHH",
    subtitle: "Priority Household",
    icon: <CreditCardIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />,
    rice: "25 kg",
    wheat: "25 kg",
    sugar: "4 kg",
    kerosene: "8 L",
  },
];

export default function RationCardSelection({ open, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    
    <Dialog
  open={open}
  onClose={onClose}
  maxWidth="md"
  fullWidth
  sx={{
    "& .MuiDialog-container": {
        mt: 5, 
        ml:20
    },
  }}
>

<DialogTitle
  sx={{
    fontWeight: "bold",
    color:"#5A8DEE",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"

  }}
>
  Select Ration Card Type

  {/* Close Icon */}
  <IconButton
    onClick={onClose}
    sx={{
      color: "#475569",
      "&:hover": {
        background: "transparent",
        color: "#1e293b",
      },
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>


      <DialogContent sx={{ background: "#fff", color: "#000" }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 3, opacity: 0.8, color: "#444" }}
        >
          Choose Card Type
        </Typography>

        <Grid container spacing={2}>
          {cardTypes.map((card, index) => (
           <Grid item xs={12} sm={6} md={6} key={index}>

              <Card
                onClick={() => setSelectedCard(card.title)}
                sx={{
                  p: 3,
                  width:415,
                  background: "#fff",
                  border:
                    selectedCard === card.title
                      ? "2px solid #5A8DEE"
                      : "1px solid #ddd",
                  borderRadius: 3,
                  cursor: "pointer",
                  "&:hover": {
                    border: "2px solid #5A8DEE",
                  },
                  transition: "0.3s",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    {card.icon}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color:
                            selectedCard === card.title ? "#5A8DEE" : "#000",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color="#555">
                        {card.subtitle}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box mt={2} sx={{ color: "#333" }}>
                    <Typography>
                      Rice: <span style={{ float: "right" }}>{card.rice}</span>
                    </Typography>
                    <Typography>
                      Wheat:{" "}
                      <span style={{ float: "right" }}>{card.wheat}</span>
                    </Typography>
                    <Typography>
                      Sugar:{" "}
                      <span style={{ float: "right" }}>{card.sugar}</span>
                    </Typography>
                    <Typography>
                      Kerosene:{" "}
                      <span style={{ float: "right" }}>{card.kerosene}</span>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer Buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "#5A8DEE",
              color: "#5A8DEE",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                borderColor: "#5A8DEE",
                background: "#eef3ff",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!selectedCard}
            sx={{
              background: "#5A8DEE",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              "&:disabled": { background: "#b9c9f5" },
            }}
          >
            Proceed with Card
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
