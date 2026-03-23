import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  TextField,
  Box,
  Typography,
  Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const TableLayout = ({ columns = [], rows = [], searchPlaceholder = "Search...", actionButtons = null, extra = {} }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(columns[0]?.id || "");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  /** Handle Sorting */
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "des" : "asc");
    setOrderBy(columnId);
  };
  /** Filter rows based on search */
  const filteredRows = rows.filter((row) => {
    if (!row || typeof row !== 'object') return false;

    return Object.values(row).some((value) =>
      String(
        typeof value === "object" ? JSON.stringify(value) : value
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  /** Sort Rows */
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!a || !b) return 0;

    const A = a[orderBy];
    const B = b[orderBy];

    const valA = typeof A === "object" ? JSON.stringify(A) : A;
    const valB = typeof B === "object" ? JSON.stringify(B) : B;

    return order === "asc"
      ? String(valA || "").localeCompare(String(valB || ""))
      : String(valB || "").localeCompare(String(valA || ""));
  });

  /** Pagination Logic */
  const paginatedData = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Paper sx={{ borderRadius: 3, boxShadow: 3, mt: 4, p: 2 }}>


      {/* 🔍 SEARCH + ACTION BUTTONS */}
      <Box
  display="flex"
  flexDirection={{ xs: "column", sm: "row" }}
  justifyContent="space-between"
  alignItems={{ xs: "stretch", sm: "center" }} 
  mb={2}
  gap={1} 
>
  {/* Search Bar */}
  <TextField
    variant="outlined"
    size="small"
    placeholder={searchPlaceholder || "Search..."}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    sx={{
      width: { xs: "100%", sm: "auto", md: "70%", lg: "60%" },
      color: "#fff",
      "& .MuiOutlinedInput-root": {
        color: isDark ? "#fff" : "#415a77",

        "& fieldset": {
          borderColor: isDark ? "#fff" : "#415a77",
        },

        "&:hover fieldset": {
          borderColor: isDark ? "#fff" : "#415a77",
        },

        "&.Mui-focused fieldset": {
          borderColor: isDark ? "#fff" : "#415a77",
        },
      },

      "& .MuiInputBase-input::placeholder": {
        color: isDark ? "#ccc" : "#415a77",
        opacity: 1,
      },
    }}
  />

  <Box
    display="flex"
    justifyContent={"center"}
    gap={1}
    mt={{ xs: 1, sm: 0 }} 
  
  >
    {actionButtons?.map((btn, index) => (
      <Button
        key={index}
        variant={btn.variant || "outlined"}
        startIcon={btn.icon || null}
        onClick={btn.onClick}
        sx={{
          bgcolor: isDark ? "#1b263b" : "#fff",
          color: isDark ? "#fff" : "#415a77",
          borderColor: isDark ? "#fff" : "#415a77",
          "&:hover": {
            borderColor: isDark ? "#fff" : "#415a77",
            bgcolor: isDark ? "#243447" : "#f5f5f5",
          },
        }}
      >
        {btn.label}
      </Button>
    ))}
  </Box>
</Box>

      <TableContainer
      >
        <Table stickyHeader>
          <TableHead
            sx={{
              bgcolor: "#415a77",
              "& .MuiTableSortLabel-root.Mui-active": { color: "#fff" },
              "& .MuiTableSortLabel-root:hover": { color: "#fff" },
            }}
          >
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || "left"}
                  sortDirection={orderBy === col.id ? order : false}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    bgcolor: "#415a77",
                  }}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData && paginatedData.length > 0 ? paginatedData.map((row, index) => {
              if (!row || typeof row !== 'object') return null; // Skip invalid rows

              return (
                <TableRow hover key={index}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      {col.render ? col.render(row, extra) : (row[col.id] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography mt={2}>No data available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={sortedRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          width: "100%",
          "@media (max-width:450px)": {
            width: "95%",
            margin: "0 auto",
            "& .MuiTablePagination-toolbar": {
              minHeight: "40px",
              padding: "0 6px"
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "12px"
            },
            "& .MuiIconButton-root": {
              padding: "4px"
            }
          }
        }}
      />
    </Paper>
  );
};

export default TableLayout;
