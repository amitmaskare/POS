import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScaleIcon from "@mui/icons-material/Scale";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { looseItemList, generateLooseBarcode } from "../../services/productService";

export default function LooseItemCounter({ open, onClose }) {
  const [looseItems, setLooseItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);
  const [printedLabels, setPrintedLabels] = useState([]);
  const [search, setSearch] = useState("");
  const weightInputRef = useRef(null);

  // Load loose items when modal opens
  useEffect(() => {
    if (open) {
      fetchLooseItems();
      setPrintedLabels([]);
      setSelectedProduct(null);
      setWeight("");
      setSearch("");
    }
  }, [open]);

  // Auto-focus weight input when product selected
  useEffect(() => {
    if (selectedProduct) {
      setTimeout(() => weightInputRef.current?.focus(), 100);
    }
  }, [selectedProduct]);

  const fetchLooseItems = async () => {
    try {
      const result = await looseItemList();
      if (result.status === true) {
        setLooseItems(result.data || []);
      }
    } catch (error) {
      console.error("Error loading loose items:", error);
    }
  };

  const pricePerUnit = selectedProduct?.price_per_unit || selectedProduct?.selling_price || 0;
  const looseUnit = selectedProduct?.loose_unit || "kg";

  const getWeightInKg = () => {
    const w = parseFloat(weight) || 0;
    if (unit === "g") return w / 1000;
    return w;
  };

  const calculatedPrice = parseFloat((getWeightInKg() * pricePerUnit).toFixed(2));

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setWeight("");
    setUnit(product.loose_unit || "kg");
  };

  const handlePrintSticker = async () => {
    if (!weight || parseFloat(weight) <= 0 || !selectedProduct) return;

    setLoading(true);
    try {
      const weightInKg = getWeightInKg();
      const result = await generateLooseBarcode({
        product_id: selectedProduct.id,
        weight: weightInKg,
      });

      if (result.status === true) {
        // Print the barcode sticker
        printBarcodeSticker(result.data);

        // Add to printed labels list
        setPrintedLabels((prev) => [
          {
            id: Date.now(),
            product_name: result.data.product_name,
            weight: result.data.weight,
            unit: result.data.unit,
            price: result.data.calculated_price,
            barcode: result.data.barcode,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ]);

        // Reset weight for next item
        setWeight("");
        setTimeout(() => weightInputRef.current?.focus(), 100);
      }
    } catch (error) {
      console.error("Error generating barcode:", error);
    } finally {
      setLoading(false);
    }
  };

  const printBarcodeSticker = (labelData) => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const printDoc = printFrame.contentWindow.document;
    printDoc.open();

    const labelHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Label - ${labelData.product_name}</title>
        <style>
          @media print {
            @page { size: 60mm 40mm; margin: 2mm; }
            body { margin: 0; padding: 0; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            width: 60mm;
            padding: 2mm;
          }
          .label { text-align: center; }
          .product-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .details {
            font-size: 10px;
            margin-bottom: 3px;
          }
          .weight-info {
            font-size: 12px;
            font-weight: bold;
            margin: 2px 0;
          }
          .price {
            font-size: 18px;
            font-weight: bold;
            margin: 3px 0;
            border: 1px solid #000;
            display: inline-block;
            padding: 2px 8px;
          }
          .barcode-container { margin: 3px 0; }
          .barcode { height: 35px; }
          .date { font-size: 9px; color: #666; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="product-name">${labelData.product_name}</div>
          <div class="weight-info">${labelData.weight} ${labelData.unit}</div>
          <div class="details">Rate: Rs.${Number(labelData.price_per_unit).toFixed(2)}/${labelData.unit}</div>
          <div class="price">Rs.${Number(labelData.calculated_price).toFixed(2)}</div>
          <div class="barcode-container">
            <svg id="barcode" class="barcode"></svg>
          </div>
          <div class="date">${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          if (typeof JsBarcode !== 'undefined') {
            JsBarcode("#barcode", "${labelData.barcode}", {
              format: "EAN13",
              width: 1.5,
              height: 35,
              displayValue: true,
              fontSize: 10,
              margin: 2
            });
          }
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 100);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printDoc.write(labelHTML);
    printDoc.close();
  };

  // Filter loose items by search
  const filteredItems = looseItems.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (item.product_name || "").toLowerCase().includes(term) ||
      (item.barcode || "").toLowerCase().includes(term)
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#415a77",
          color: "#fff",
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScaleIcon />
          <Typography variant="h6" fontWeight="bold">
            Loose Item Counter
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: "75vh", display: "flex" }}>
        {/* LEFT PANEL - Loose Item List */}
        <Box
          sx={{
            width: "40%",
            borderRight: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search loose items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Items List */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
            {filteredItems.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
                <ScaleIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                <Typography>No loose items found</Typography>
                <Typography variant="caption">
                  Add products with favourite = "loose" to see them here
                </Typography>
              </Box>
            ) : (
              filteredItems.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => handleSelectProduct(item)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    border:
                      selectedProduct?.id === item.id
                        ? "2px solid #4caf50"
                        : "1px solid #e0e0e0",
                    bgcolor:
                      selectedProduct?.id === item.id ? "#e8f5e9" : "#fff",
                    "&:hover": {
                      bgcolor:
                        selectedProduct?.id === item.id
                          ? "#e8f5e9"
                          : "#f5f5f5",
                    },
                    transition: "all 0.15s",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.product_name}
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 45,
                        height: 45,
                        borderRadius: 2,
                        bgcolor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ScaleIcon sx={{ color: "#999" }} />
                    </Box>
                  )}

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: "14px", lineHeight: 1.2 }}
                    >
                      {item.product_name}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "12px", color: "#4caf50", fontWeight: 600 }}
                    >
                      Rs.{Number(item.price_per_unit || item.selling_price).toFixed(2)} / {item.loose_unit || "kg"}
                    </Typography>
                    {item.barcode && (
                      <Typography
                        sx={{ fontSize: "11px", color: "#1976d2", fontFamily: "monospace", mt: 0.3 }}
                      >
                        {item.barcode}
                      </Typography>
                    )}
                  </Box>

                  {selectedProduct?.id === item.id && (
                    <CheckCircleIcon sx={{ color: "#4caf50" }} />
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* RIGHT PANEL - Weighing + Labels */}
        <Box sx={{ width: "60%", display: "flex", flexDirection: "column" }}>
          {/* Weighing Section */}
          <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
            {!selectedProduct ? (
              <Box sx={{ textAlign: "center", py: 6, color: "#999" }}>
                <ScaleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select an item from the list to start weighing
                </Typography>
              </Box>
            ) : (
              <>
                {/* Selected Product Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.product_name}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedProduct.product_name}
                    </Typography>
                    <Chip
                      icon={<ScaleIcon sx={{ fontSize: 16 }} />}
                      label={`Rs.${Number(pricePerUnit).toFixed(2)} / ${looseUnit}`}
                      color="success"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                {/* Weight Input Row */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <ToggleButtonGroup
                      value={unit}
                      exclusive
                      onChange={(e, val) => val && setUnit(val)}
                      size="small"
                      sx={{ mb: 1 }}
                    >
                      <ToggleButton value="kg">KG</ToggleButton>
                      <ToggleButton value="g">Grams</ToggleButton>
                    </ToggleButtonGroup>
                    <TextField
                      label={`Weight (${unit})`}
                      type="number"
                      fullWidth
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      inputRef={weightInputRef}
                      inputProps={{ min: 0, step: unit === "g" ? 1 : 0.001 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePrintSticker();
                      }}
                    />
                  </Box>

                  {/* Live Price */}
                  <Box
                    sx={{
                      minWidth: 160,
                      p: 2,
                      bgcolor: calculatedPrice > 0 ? "#e8f5e9" : "#f5f5f5",
                      borderRadius: 2,
                      textAlign: "center",
                      border: calculatedPrice > 0 ? "2px solid #4caf50" : "1px solid #ddd",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Total Price
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={calculatedPrice > 0 ? "success.main" : "text.disabled"}
                    >
                      Rs.{calculatedPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Print Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<PrintIcon />}
                  onClick={handlePrintSticker}
                  disabled={!weight || parseFloat(weight) <= 0 || loading}
                  sx={{
                    bgcolor: "#415a77",
                    py: 1.5,
                    fontSize: "16px",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#344e64" },
                  }}
                >
                  {loading ? "Printing..." : "Print Sticker & Barcode"}
                </Button>
              </>
            )}
          </Box>

          {/* Printed Labels Section */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ mb: 1, color: "#666" }}
            >
              Printed Labels Today ({printedLabels.length})
            </Typography>

            {printedLabels.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3, color: "#bbb" }}>
                <PrintIcon sx={{ fontSize: 36, opacity: 0.3 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  No labels printed yet
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Barcode</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {printedLabels.map((label) => (
                      <TableRow key={label.id}>
                        <TableCell>
                          <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                            {label.product_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${label.weight} ${label.unit}`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: "12px" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: "#2e7d32" }}>
                            Rs.{Number(label.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#1976d2",
                            }}
                          >
                            {label.barcode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "12px", color: "#999" }}>
                            {label.time}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
