import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CloseIcon from "@mui/icons-material/Close";
import { cardTypeList } from "../../services/rationcardService";

export default function RationCardSelection({ open, onClose }) {
  const [cardTypes, setCardTypes] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    getCardType();
  }, []);

  const getCardType = async () => {
    try {
      const result = await cardTypeList();

      if (result.status === true) {
        const formattedData = result.data.map((card) => {
          const parsedItems = JSON.parse(card.items);

          // Convert array → object: { Rice: "15kg", Wheat: "10kg", ... }
          const itemObject = parsedItems.reduce((acc, item) => {
            acc[item.item_name] = item.quantity;
            return acc;
          }, {});

          return {
            id: card.id,
            title: card.type,
            icon: getCardIcon(card.type),
            items: itemObject,
          };
        });

        setCardTypes(formattedData);
      }
    } catch (error) {
      console.log("Error loading card types", error);
    }
  };

  // Attach icons based on card type
  const getCardIcon = (type) => {
    switch (type) {
      case "APL":
        return <HomeIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />;
      case "BPL":
        return <ShieldIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />;
      case "AAY":
        return <PersonIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />;
      case "PHH":
        return <CreditCardIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />;
      default:
        return <HomeIcon sx={{ fontSize: 32, color: "#5A8DEE" }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          mt: 5,
          ml: 20,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: "#5A8DEE",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Select Ration Card Type

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
          {cardTypes.map((card) => (
            <Grid item xs={12} sm={6} md={6} key={card.id}>
              <Card
                onClick={() => setSelectedCard(card.title)}
                sx={{
                  p: 3,
                  width: 415,
                  background: "#fff",
                  border:
                    selectedCard === card.title
                      ? "2px solid #5A8DEE"
                      : "1px solid #ddd",
                  borderRadius: 3,
                  cursor: "pointer",
                  "&:hover": { border: "2px solid #5A8DEE" },
                  transition: "0.3s",
                }}
              >
                <CardContent>
                  {/* Header (Icon + Title) */}
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
                    </Box>
                  </Stack>

                  {/* Items Dynamically Rendered */}
                  <Box mt={2} sx={{ color: "#333" }}>
                    {Object.entries(card.items).map(([name, qty], i) => (
                      <Typography key={i}>
                        {name}: <span style={{ float: "right" }}>{qty}</span>
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
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
