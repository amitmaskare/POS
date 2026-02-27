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
            variant: "contained",
            bgcolor: "#3b82f6",
          },
          {
            label: "Filter",
            icon: <FilterListIcon />,
            variant: "contained",
            bgcolor: "#3b82f6",
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
        <table className="table table-bordered mt-3">
  <thead className="table-light">
    <tr>
      <th>#</th>
      <th>Invoice</th>
      <th>Amount</th>
      <th>Mode</th>
      <th>Status</th>
      <th>Payment ID</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {transactions.length === 0 ? (
      <tr>
        <td colSpan="7" className="text-center">
          No Transactions Found
        </td>
      </tr>
    ) : (
      transactions.map((t, i) => (
        <tr key={t.id}>
          <td>{i + 1}</td>
          <td>{t.invoice_no}</td>
          <td>₹{t.total}</td>
          <td>
            <span className={`badge bg-${t.payment_mode === "cash" ? "success" : "primary"}`}>
              {t.payment_mode}
            </span>
          </td>
          <td>
            <span className={`badge bg-${t.payment_status === "paid" ? "success" : "danger"}`}>
              {t.payment_status}
            </span>
          </td>
          <td>{t.razorpay_payment_id || "-"}</td>
          <td>{new Date(t.created_at).toLocaleString()}</td>
        </tr>
      ))
    )}
  </tbody>
</table>

    </Box>
    </>
  );
}
