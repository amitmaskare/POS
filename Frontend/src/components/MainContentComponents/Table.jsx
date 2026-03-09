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

const TableLayout = ({ columns = [], rows = [], searchPlaceholder = "Search..." ,actionButtons = null,extra = {}  }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(columns[0]?.id || "");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  /** Handle Sorting */
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
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

  return (
    <Paper sx={{ borderRadius: 3, boxShadow: 3, mt: 4, p: 2 }}>
      

     {/* 🔍 SEARCH + ACTION BUTTONS */}
<Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  mb={2}
>
  {/* Search Bar */}
  <TextField
    variant="outlined"
    size="small"
    placeholder={searchPlaceholder || "Search..."}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    sx={{
      width: {
        xs: "100%",   // mobile
        sm: "100%",
        md: "70%",
        lg: "60%"
      }
    }}
  />

  {/* ⭐ Reusable Buttons */}
  <Box display="flex" gap={1}>
  {actionButtons?.map((btn, index) => (
    <Button
      key={index}
      variant={btn.variant || "contained"}
      startIcon={btn.icon || null}
      color={btn.color || "primary"}
      onClick={btn.onClick}
      sx={{
       color:"#415a77",
        border: "1px solid #415a77",
       
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
      />
    </Paper>
  );
};

export default TableLayout;
