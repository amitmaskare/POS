import React from "react";
import { Box, IconButton, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import { useTheme } from "@mui/material/styles";
const PosCart = ({
  title,
  cart,
  deleteItem,
  updateQty,
  updatePrice,
  editingPriceId,
  setEditingPriceId,
  subtotal,
  tax,
  total,
  totalTax,
  renderPaymentButtons,
  renderCartOptions,
  checkoutSale,
  isReturn = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <aside
      className="cart p-3"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDark ? "#1b263b" : "#fff"
      }}
    >
      <h4 className="fw-bold mb-4" style={{ color: isDark ? "#fff" : "#415a77" }}>
        {title}
      </h4>

      {/* Product List */}
      <div
  style={{
    flex: 1,
    overflowY: "auto",
    paddingRight: 8,
    paddingTop: 4,
  }}
>
  {cart.map((item) => (
    <Box
      key={item.id}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        p: 1.5,
        mb: 1.5,
        borderRadius: "16px",
        bgcolor: "#fff",
        border: "1px solid #f0f2f5",
        boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        border:"1px solid #c5cee0",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 15px 30px rgba(65, 90, 119, 0.08)",
          borderColor: "#e0e7ff",
        },
      }}
    >
      {/* Visual Accent - A subtle stripe on the left */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor:  "#415a77"
          
        }}
      />

      {/* Product Image with soft shadow */}
      <Box
        component="img"
        src={item?.image || ""}
        alt="product"
        sx={{
          width: 60,
          height: 60,
          borderRadius: "50%",
         
          objectFit: "cover",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      />

      {/* Product Info */}
      <Box flex={1}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "#415a77",
                textTransform: "capitalize"
              }}
            >
              {item.product_name}
            </Typography>
            <Box
    sx={{
      mt: 0.5,
      px: 1,
      py: "2px",
      borderRadius: 1,
      fontSize: 11,
      fontWeight: 600,
      display: "inline-block",
      bgcolor: "#647D9A",
      color:  "#fff"
    }}
  >
    QTY: {item.qty}
  </Box>
          </Box>

          <IconButton
            size="small"
            onClick={() => deleteItem(item.id)}
            sx={{
              color: "#E63946",
              bgcolor: "rgba(230, 57, 70, 0.05)",
              "&:hover": { bgcolor: "rgba(230, 57, 70, 0.12)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Controls Row */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          {/* Quantity Stepper */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#F8FAFC",
              borderRadius: "10px",
              border: "1px solid #EDF2F7",
            }}
          >
            {isReturn && item.return_qty ? (
              <Typography sx={{ px: 2, fontWeight: 700, color: "#415A77" }}>
                {item.return_qty}
              </Typography>
            ) : (
              <>
                <IconButton 
                  size="small" 
                  onClick={() => updateQty(item.id, "dec")}
                  sx={{ color: "#415A77", p: 0.5 }}
                >
                  <span style={{ fontSize: 18 }}>−</span>
                </IconButton>
                <Typography 
                  sx={{ width: 30, textAlign: "center", fontWeight: 700, fontSize: 14 ,color: "#415a77"}}
                >
                  {item.qty}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => updateQty(item.id, "inc")}
                  sx={{ color: "#415A77", p: 0.5 }}
                >
                  <span style={{ fontSize: 18 }}>+</span>
                </IconButton>
              </>
            )}
          </Box>

          {/* Price Section */}
          <Box display="flex" alignItems="center">
            {editingPriceId === item.id ? (
              <input
                type="number"
                value={item.price}
                autoFocus
                style={{
                  width: 70,
                  textAlign: "right",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "2px solid #415A77",
                  outline: "none",
                  fontWeight: 600,
                }}
                onChange={(e) => updatePrice(item.id, e.target.value)}
                onBlur={() => setEditingPriceId(null)}
                onKeyDown={(e) => e.key === "Enter" && setEditingPriceId(null)}
              />
            ) : (
              <Box 
                onClick={() => setEditingPriceId(item.id)}
                sx={{ 
                  cursor: "pointer", 
                  textAlign: "right",
                  "&:hover .edit-icon": { opacity: 1 } 
                }}
              >
                <Typography 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: "15px", 
                    color: "#415a77",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5
                  }}
                >
                  ₹{item.price}
                  <EditIcon 
                    className="edit-icon"
                    sx={{ fontSize: 14, transition: "0.2s" }} 
                  />
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  ))}
</div>

      {/* Totals */}
      <div className="border-top pt-3 mt-4">
        <div className="d-flex justify-content-between mb-2">
          <span>
            {isReturn && total < 0 ? "Subtotal (Refund)" : "Subtotal"}
          </span>
          <span>
            ₹{isReturn
              ? Math.abs(Number(subtotal)).toFixed(2)
              : Number(subtotal).toFixed(2)}
          </span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span >Tax ({totalTax}%)</span>
          <span>
            ₹{isReturn
              ? Math.abs(Number(tax)).toFixed(2)
              : Number(tax).toFixed(2)}
          </span>
        </div>

        <div className="d-flex justify-content-between fw-bold border-top pt-3 mt-4">
          <span style={{ color: isDark ? "#fff" : "#415a77" }}>
            {isReturn && total < 0 ? "Total Refund" : "Total"}
          </span>
          <span style={{ color: isDark ? "#fff" : "#415a77" }}>
            ₹{isReturn
              ? Math.abs(Number(total)).toFixed(2)
              : Number(total).toFixed(2)}
          </span>
        </div>

        {/* Payment Buttons */}
        <div className="mt-3" style={{ color: isDark ? "#fff" : "#415a77" }}>
          {renderPaymentButtons}

        </div>

        {/* Cart Options */}
        <div className="mt-3" style={{ color: isDark ? "#fff" : "#415a77" }} >
          {renderCartOptions}

        </div>

        {/* Print */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success" onClick={checkoutSale}>
            <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
            Print Receipt
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PosCart;
