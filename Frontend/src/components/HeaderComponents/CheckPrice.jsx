import {useState} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import HistoryIcon from "@mui/icons-material/History";
import SearchFilter from "../MainContentComponents/SearchFilter";
import { searchProduct } from "../../services/productService";
export default function CheckPriceModal({ open, onClose }) {

  const[data,setData]=useState([])
       const[success,setSuccess]=useState('')
       const[error,setError]=useState('')
       const[loading,setLoading]=useState(false)
       const [searchValue, setSearchValue] = useState("");
  const handleSearch = async (value) => {
    setSearchValue(value);
    if (!value) {
      setData([]);
      return;
    }
   setError("")
    try {
      const result = await searchProduct({ search: value })
      if (result.status===true) {
        setData(result.data);
        setSearchValue("");
        setError("");
      } else {
        setData([]);
        setError("No product found");
      }
    } catch (err) {
      setError("Something went wrong");
    } 
  };
  const item=data
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        background: "#f8fafc",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        mt: 8,
        
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
        fontSize: 20,
          fontWeight: 600,
          borderBottom: "1px solid #e0e0e0",
         color:"#fff",
         backgroundColor:"#415a77",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}  >
          <HistoryIcon />
         Check Price
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            minWidth: "auto",
            color: "#fff",
            "&:hover": { background: "transparent", color: "#1e293b" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
     
      <SearchFilter  value={searchValue} onSearchChange={(e) => handleSearch(e.target.value)}/>
      {/* CONTENT */}
      <DialogContent sx={{ p: 3, mt: 1 }}>
      { item && (
        <Paper
          key={item.id}
          sx={{
            p: 2,
            mb: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        
        {/* Left side: Image + Name */}
        <Box display="flex" alignItems="center" gap={2}>
          <img
            src={item.image}
            alt="product"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 10,
              border: "1px solid #e5e7eb"
            }}
          />

          <Box>
            <Typography
              fontWeight={600}
              fontSize={15}
              sx={{ color: "#1f2937" }}
            >
              {item.product_name}
            </Typography>

            <Typography
              fontSize={12}
              sx={{ color: "#6b7280", mt: 0.3 }}
            >
              Product ID: {item.id}
            </Typography>
          </Box>
        </Box>

        {/* Right side: Price */}
        <Box textAlign="right">
          <Typography
            fontSize={13}
            sx={{ color: "#6b7280" }}
          >
            Price
          </Typography>

          <Typography
            fontSize={18}
            fontWeight={700}
            sx={{ color: "#111827" }}
          >
            ${item.price}
          </Typography>
        </Box>

      </Box>
    </Paper>
  )}
</DialogContent>
    </Dialog>
  );
}
