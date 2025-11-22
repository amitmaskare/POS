
import React, { useState,useEffect } from "react";
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
import { productList } from "../../services/productService";

 
const ProductTable = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);               
  const [rowsPerPage, setRowsPerPage] = useState(5); 
  const[data,setData]=useState([])
  const[success,setSuccess]=useState('')
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)

  useEffect(()=>{
fetchProductList()
},[])

  const fetchProductList =async()=>{
    setSuccess(null)
    setError(null)
    try{
      const result=await productList()
      if(result.status===true)
      {
        setSuccess(result.message)
        setData(result.data)
      }else{
        setError(result.message)
      }
    }catch(error)
    {
        setError(error.response?.data?.message || error.message);
    }
  }

  //console.log(data); return false;

//   const products = [
//   { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
//   { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
//   { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
//   { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
//   { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
//   { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
//   { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
//   { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
//   { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
//   { sku: "P001", name: "Apple", category: "Fruits", units: "1 Kg", price: 100, stock: 20, supplier: "Fresh Farm", status: "Active" },
//   { sku: "P002", name: "Banana", category: "Fruits", units: "1 Dozen", price: 60, stock: 5, supplier: "Tropical", status: "Low Stock" },
//   { sku: "P003", name: "Milk", category: "Dairy", units: "1 Litre", price: 50, stock: 50, supplier: "Amul", status: "Active" },
  
// ];
  // Handle pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
  const paginatedData = data.slice(
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
            {paginatedData.map((item, index) => (
              <TableRow hover key={index}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.category_id}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>₹{item.cost_price}</TableCell>
                <TableCell>{item.min_stock}</TableCell>
                <TableCell>{item.supplier_id}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* ⭐ MUI PAGINATION */}
      <TablePagination
        component="div"
        count={data.length}
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
