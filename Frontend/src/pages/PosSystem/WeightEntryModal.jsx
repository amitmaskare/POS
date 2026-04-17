import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ScaleIcon from "@mui/icons-material/Scale";
import PrintIcon from "@mui/icons-material/Print";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { generateLooseBarcode } from "../../services/productService";

export default function WeightEntryModal({ open, onClose, product, onAddToCart }) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);
  const weightInputRef = useRef(null);

  const pricePerUnit = product?.price_per_unit || product?.selling_price || 0;
  const looseUnit = product?.loose_unit || "kg";

  useEffect(() => {
    if (open) {
      setWeight("");
      setUnit(looseUnit);
      // Auto-focus weight input
      setTimeout(() => weightInputRef.current?.focus(), 100);
    }
  }, [open, looseUnit]);

  // Convert weight to kg for calculation (all prices stored per kg)
  const getWeightInKg = () => {
    const w = parseFloat(weight) || 0;
    if (unit === "g") return w / 1000;
    return w; // already in kg
  };

  const calculatedPrice = parseFloat((getWeightInKg() * pricePerUnit).toFixed(2));
  const displayWeight = parseFloat(weight) || 0;

  const handleAddToCart = () => {
    if (!weight || parseFloat(weight) <= 0) return;

    const weightInKg = getWeightInKg();

    const looseCartItem = {
      ...product,
      id: `${product.id}_loose_${Date.now()}`, // Unique ID for each loose entry
      product_id: product.id,
      product_name: product.product_name,
      qty: weightInKg,
      selling_price: pricePerUnit,
      price: calculatedPrice,
      total: calculatedPrice,
      image: product.image,
      tax: product.tax || product.tax_rate || 0,
      is_loose: 1,
      price_per_unit: pricePerUnit,
      loose_unit: looseUnit,
      loose_weight: weightInKg,
      min_qty: product.min_qty,
      offer_price: product.offer_price,
      offer_qty_price: product.offer_qty_price,
    };

    onAddToCart(looseCartItem);
    onClose();
  };

  const handlePrintLabel = async () => {
    if (!weight || parseFloat(weight) <= 0) return;

    setLoading(true);
    try {
      const weightInKg = getWeightInKg();
      const result = await generateLooseBarcode({
        product_id: product.id,
        weight: weightInKg,
      });

      if (result.status === true) {
        // Print the barcode label
        printBarcodeLabel(result.data);

        // Also add to cart
        const looseCartItem = {
          ...product,
          id: `${product.id}_loose_${Date.now()}`,
          product_id: product.id,
          product_name: product.product_name,
          qty: weightInKg,
          selling_price: pricePerUnit,
          price: result.data.calculated_price,
          total: result.data.calculated_price,
          image: product.image,
          tax: product.tax || product.tax_rate || 0,
          is_loose: 1,
          price_per_unit: pricePerUnit,
          loose_unit: looseUnit,
          loose_weight: weightInKg,
          weighted_barcode: result.data.barcode,
        };

        onAddToCart(looseCartItem);
        onClose();
      }
    } catch (error) {
      console.error("Error generating barcode:", error);
    } finally {
      setLoading(false);
    }
  };

  const printBarcodeLabel = (labelData) => {
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
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .details {
            font-size: 10px;
            margin-bottom: 4px;
          }
          .price {
            font-size: 16px;
            font-weight: bold;
            margin: 4px 0;
          }
          .barcode-container { margin: 4px 0; }
          .barcode { height: 35px; }
          .date { font-size: 9px; color: #666; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="product-name">${labelData.product_name}</div>
          <div class="details">
            Weight: ${labelData.weight} ${labelData.unit} | Rate: Rs.${Number(labelData.price_per_unit).toFixed(2)}/${labelData.unit}
          </div>
          <div class="price">Rs.${Number(labelData.calculated_price).toFixed(2)}</div>
          <div class="barcode-container">
            <svg id="barcode" class="barcode"></svg>
          </div>
          <div class="date">${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
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

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#f8f9fa" }}>
        <ScaleIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Weigh Item - {product.product_name}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Product Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: 1 }}>
          {product.image && (
            <img
              src={product.image}
              alt={product.product_name}
              style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }}
            />
          )}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {product.product_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rate: Rs.{Number(pricePerUnit).toFixed(2)} / {looseUnit}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Unit Toggle */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Unit
          </Typography>
          <ToggleButtonGroup
            value={unit}
            exclusive
            onChange={(e, val) => val && setUnit(val)}
            size="small"
          >
            <ToggleButton value="kg">KG</ToggleButton>
            <ToggleButton value="g">Grams</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Weight Input */}
        <TextField
          label={`Enter Weight (${unit})`}
          type="number"
          fullWidth
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          inputRef={weightInputRef}
          inputProps={{ min: 0, step: unit === "g" ? 1 : 0.001 }}
          sx={{ mb: 3 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddToCart();
          }}
        />

        {/* Live Price Calculation */}
        <Box
          sx={{
            p: 2,
            bgcolor: calculatedPrice > 0 ? "#e8f5e9" : "#f5f5f5",
            borderRadius: 2,
            textAlign: "center",
            border: calculatedPrice > 0 ? "2px solid #4caf50" : "1px solid #ddd",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {displayWeight > 0
              ? `${displayWeight} ${unit} x Rs.${Number(pricePerUnit).toFixed(2)}/${looseUnit}`
              : "Enter weight to see price"}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={calculatedPrice > 0 ? "success.main" : "text.disabled"}>
            Rs.{calculatedPrice.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrintLabel}
          disabled={!weight || parseFloat(weight) <= 0 || loading}
        >
          {loading ? "Printing..." : "Print Label"}
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={!weight || parseFloat(weight) <= 0}
        >
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
