import {useState,useEffect} from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import Title from "../../components/MainContentComponents/Title";
import SearchFilter from "../../components/MainContentComponents/SearchFilter";
import {transactionList} from "../../services/saleService"

export default function Transactions() {
const [transactions, setTransactions] = useState([]);
  const fetchTransactions = async () => {
  try {
    const result = await transactionList();
    if(result.status===true)
    {
      setTransactions(result.data);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchTransactions();
}, []);


  return (
    <>
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}

      <Title
        title="Transactions"
        subtitle="Manage store transactions"
        actions={[
          {
            label: "Date Range",
            icon: <CalendarTodayIcon />,
            variant: "outlined",
          },
          {
            label: "Filter",
            icon: <FilterListIcon />,
            variant: "outlined",
          },
          {
            label: "New Transaction",
            icon: <AddIcon />,
            variant: "contained",
            bgcolor: "#3b82f6",
          },
        ]}
      />
      <Box sx={{ mt: 3 }}>
        <SearchFilter
          placeholder="Search by transactions..."
          buttons={[
            {
              label: "",
              icon: <RefreshIcon />,
              onClick: () => console.log("Filter clicked"),
            }
          ]}
        />
      </Box>
      {/* All Transactions Box */}
      <Paper
        sx={{
          p: 2,
          mt: 3
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          All Transactions
        </Typography>
      </Paper>
      <Box
  sx={{
    width: "100%",
    "@media (max-width:500px)": {
      width: "100%",
      margin: "0 auto",
      "& .MuiTableCell-root": {
        padding: "6px",
        fontSize: "12px"
      }
    }
  }}>
      <TableLayout
  columns={columns}
  rows={transactions}
  searchPlaceholder="Search transactions..."
  extra={{
    indexMap: Object.fromEntries(
      transactions.map((t, i) => [t.id, i + 1])
    )
  }}
/>
</Box>
    </Box>
    </>
  );
}
