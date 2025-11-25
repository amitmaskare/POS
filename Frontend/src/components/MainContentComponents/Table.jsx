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

const TableLayout = ({ columns = [], rows = [], searchPlaceholder = "Search..." ,actionButtons = null  }) => {
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
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(
        typeof value === "object" ? JSON.stringify(value) : value
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  /** Sort Rows */
  const sortedRows = [...filteredRows].sort((a, b) => {
    const A = a[orderBy];
    const B = b[orderBy];

    const valA = typeof A === "object" ? JSON.stringify(A) : A;
    const valB = typeof B === "object" ? JSON.stringify(B) : B;

    return order === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
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
    sx={{ width: "300px" }}
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
    >
      {btn.label}
    </Button>
  ))}
</Box>
</Box>

      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead
            sx={{
              bgcolor: "#5A8DEE",
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
                    bgcolor: "#5A8DEE",
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
            {paginatedData.map((row, index) => (
              <TableRow hover key={index}>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    {/* custom renderer support */}
                    {col.render ? col.render(row[col.id], row) : row[col.id]
}
                    

                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Show empty text when no results */}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography mt={2}>No results found</Typography>
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
