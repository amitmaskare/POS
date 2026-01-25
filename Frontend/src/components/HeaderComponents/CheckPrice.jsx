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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
        "& .MuiDialog-container": {
          ml:20
      },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 20,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} color="#5A8DEE">
          <HistoryIcon />
         Check Price
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ "&:hover": { background: "transparent" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
     
      <SearchFilter  value={searchValue} onSearchChange={(e) => handleSearch(e.target.value)}/>
      {/* CONTENT */}
      <DialogContent sx={{ p: 3, mt: 2 }}>
        {/* {data.map((item) => ( */}
         { item &&  ( 
          <Paper
            key={item.id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              background: "#fff",
            }}
          >
            {/* Row 1 */}
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={600} color="#5A8DEE">
                #  <img
              src={item.image}
              alt="product"
              className="rounded-3"
              style={{ width: 55, height: 55, objectFit: "cover" }}
            /> {item.product_name}
              </Typography>

            </Box>

            {/* Amount */}
            <Typography fontSize={26} fontWeight={700} mt={1}>
              ${item.price}
            </Typography>

          </Paper>
         )}
      </DialogContent>
    </Dialog>
  );
}
