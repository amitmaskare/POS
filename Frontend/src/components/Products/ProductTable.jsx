
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
} from "@mui/material";

const products = [
  { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
  { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
  { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
  { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
  { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
  { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
  { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
  { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
  { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
  { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
  { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
  { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
  
];

const ProductTable = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);               // ⭐ page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // ⭐ rows per page

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ⭐ Correct slicing (MUI style pagination)
  const paginatedData = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ borderRadius: 3, boxShadow: 3, marginTop: 5 }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
        
          {/* TABLE HEADER */}
          <TableHead sx={{
            bgcolor: "#5A8DEE",
            "& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": {
              color: "white !important",
            },
            "& .MuiTableSortLabel-root.Mui-active": { color: "white !important" },
          }}>
            <TableRow>
              {[
                { id: "sku", label: "SKU" },
                { id: "name", label: "Name" },
                { id: "category", label: "Category" },
                { id: "units", label: "Units/Package" },
                { id: "price", label: "Unit Price" },
                { id: "stock", label: "Stock" },
                { id: "supplier", label: "Supplier" },
                { id: "status", label: "Status" },
              ].map((col) => (
                <TableCell
                  key={col.id}
                  sx={{ color: "white", fontWeight: "bold", bgcolor: "#5A8DEE" }}
                >
                  <TableSortLabel active direction={order}>
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* TABLE BODY */}
          <TableBody>
            {paginatedData.map((product, index) => (
              <TableRow hover key={index}>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.units}</TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.supplier}</TableCell>
                <TableCell>{product.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* ⭐ MUI PAGINATION */}
      <TablePagination
        component="div"
        count={products.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{
          ".MuiTablePagination-toolbar": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            mt: 0,
            mb: 0,
          },
        }}
      />
      
    </Paper>
  );
};

export default ProductTable;
