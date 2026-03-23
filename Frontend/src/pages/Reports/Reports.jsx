import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Header from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import {
  getSalesList,
  getProductList,
  getPurchaseReport,
  getLowStockReport,
  calculateStats,
  getSalesChartData,
  getProductPerformanceData,
  downloadReport,
  getRecentReports,
} from "../../services/reportService";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

import { useTheme } from "@mui/material/styles";
const Reports = () => {
  const [statsData, setStatsData] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [productChartData, setProductChartData] = useState([]);
  const [purchaseChartData, setPurchaseChartData] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [purchaseRawData, setPurchaseRawData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewData, setViewData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  const { showToast, toastMessage, toastType, showToastNotification } =
    useToast();

  const COLORS = ["#6ca0fe", "#ffc44d", "#52c41a", "#ff7a45", "#1890ff"];

  // Fetch all report data on component mount
  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch sales and transaction data
      const [salesRes, productsRes, purchaseRes, lowStockRes] = await Promise.all([
        getSalesList(),
        getProductList(),
        getPurchaseReport(),
        getLowStockReport(),
      ]);

      // Calculate stats from sales
      if (salesRes.status && salesRes.data) {
        const stats = calculateStats(salesRes.data);
        const chartData = getSalesChartData(salesRes.data);
        setSalesData(salesRes.data);

        setStatsData([
          {
            title: "Total Sales",
            value: `$${stats.totalSales}`,
            change: "+12.5%",
            color: "#6ca0fe",
            icon: <BarChartIcon sx={{ fontSize: 30, color: "#6ca0fe" }} />,
          },
          {
            title: "Transactions",
            value: stats.transactions.toString(),
            change: "+4.2%",
            color: "green",
            icon: (
              <BarChartIcon sx={{ fontSize: 30, color: "green" }} />
            ),
          },
          {
            title: "Average Transaction",
            value: `$${stats.avgTransaction}`,
            change: "+3.1%",
            color: "#ffc44d",
            icon: <TrendingUpIcon sx={{ fontSize: 30, color: "#ffc44d" }} />,
          },
          {
            title: "Top Product",
            value: stats.topProduct,
            sub: "15 sold",
            color: "#6ca0fe",
            icon: <BarChartIcon sx={{ fontSize: 30, color: "#6ca0fe" }} />,
          },
        ]);

        setSalesChartData(chartData);
      }

      // Set product chart data & full product list
      if (productsRes.status && productsRes.data) {
        const productData = getProductPerformanceData(productsRes.data);
        setProductChartData(productData);
        setProductsData(productsRes.data);
      }

      // Purchase report -> chart (group by date)
      if (purchaseRes && purchaseRes.status && purchaseRes.data) {
        const purchases = purchaseRes.data;
        setPurchaseRawData(purchases);
        const grouped = {};
        purchases.forEach((p) => {
          const date = p.purchase_date || new Date(p.purchase_date).toLocaleDateString();
          grouped[date] = (grouped[date] || 0) + parseFloat(p.amount || 0);
        });
        const purchaseChart = Object.entries(grouped).map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed ? amount.toFixed(2) : amount) }));
        setPurchaseChartData(purchaseChart);
      }

      // Low stock
      if (lowStockRes && lowStockRes.status && lowStockRes.data) {
        setLowStockData(lowStockRes.data);
      }

      // Set recent reports
      setRecentReports(getRecentReports());

      showToastNotification("Reports loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching report data:", error);
      showToastNotification(
        error?.message || "Failed to load reports",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);

    // Set appropriate data based on report type
    switch (report.type) {
      case "sales":
        setViewData(salesChartData);
        break;
      case "products":
        setViewData(productChartData);
        break;
      default:
        setViewData([]);
    }
  };

  const handleViewPurchase = (title = "Purchase Overview") => {
    // map purchaseChartData to use `sales` key for dialog
    const mapped = purchaseChartData.map((p) => ({ date: p.date, sales: p.amount }));
    setSelectedReport({ title, type: "sales" });
    setViewData(mapped);
    setViewDialogOpen(true);
  };

  const handleViewLowStock = (title = "Low Stock") => {
    const mapped = lowStockData.map((p) => ({ name: p.product_name, value: p.stock }));
    setSelectedReport({ title, type: "products" });
    setViewData(mapped);
    setViewDialogOpen(true);
  };

  const handleDownloadReport = async (report) => {
    try {
      showToastNotification("Preparing download...", "info");
      let dataToDownload = [];

      switch (report.type) {
        case "sales":
          dataToDownload = salesChartData;
          break;
        case "products":
          dataToDownload = productChartData;
          break;
        default:
          dataToDownload = [];
      }

      if (dataToDownload.length === 0) {
        showToastNotification("No data to download", "warning");
        return;
      }

      await downloadReport(report.type, dataToDownload);
      showToastNotification("Report downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading report:", error);
      showToastNotification(error?.message || "Failed to download report", "error");
    }
  };

  const handleDownloadPurchase = async () => {
    if (!purchaseRawData || purchaseRawData.length === 0) {
      showToastNotification("No purchase data to download", "warning");
      return;
    }
    try {
      await downloadReport("purchase", purchaseRawData);
      showToastNotification("Purchase report downloaded", "success");
    } catch (error) {
      showToastNotification(error?.message || "Failed to download", "error");
    }
  };

  const handleDownloadLowStock = async () => {
    if (!lowStockData || lowStockData.length === 0) {
      showToastNotification("No low-stock data to download", "warning");
      return;
    }
    try {
      await downloadReport("low_stock", lowStockData);
      showToastNotification("Low stock report downloaded", "success");
    } catch (error) {
      showToastNotification(error?.message || "Failed to download", "error");
    }
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header
        title="Reports"
        subtitle="Analytics and business insights"
        actions={[
          {
            label: "Today",
            color: "#5A8DEE",
            variant: "outlined",
          },
          {
            label: "Custom Range",
            variant: "outlined",
            color: "#5A8DEE",
          },
        ]}
      />

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Box sx={{ mt: 3 }}>
            <Stats stats={statsData} />
          </Box>

          {/* Charts Section */}
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Overview Charts
            </Typography>
            <Grid container spacing={3} justifyContent="space-around">
            {/* Sales Overview Chart */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
      borderRadius: 3,
      mt: 3,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      transition: "0.3s",
      "&:hover": {
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Typography
        fontWeight={600}
        fontSize="16px"
        mb={2}
        sx={{color: isDark ? "#fff" : "#415a77"}}
      >
                    Sales Overview
                  </Typography>

                  {salesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Legend />
                        <Bar dataKey="sales" fill="#6ca0fe" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" mt={6}>
                      <BarChartIcon
                        sx={{ fontSize: 50, color: "#6ca0fe" }}
                      />
                      <Typography mt={1}>No sales data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Product Performance Chart */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
      borderRadius: 3,
      mt: 3,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      transition: "0.3s",
      "&:hover": {
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Typography
        fontWeight={600}
        fontSize="16px"
        mb={2}
        sx={{color: isDark ? "#fff" : "#415a77"}}
      >
                    Product Performance
                  </Typography>

                  {productChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={productChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toFixed(2)} />
                        <Legend />
                        <Bar dataKey="value" fill="#52c41a" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" mt={6}>
                      <TrendingUpIcon sx={{ fontSize: 50, color: "#415A77" }} />
                      <Typography mt={1} sx={{color: isDark ? "#fff" : "#415a77"}} fontWeight={600}>
                        No product data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Purchase Overview Chart */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  border: "1px solid #5A8DEE",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography fontWeight={600} mb={2} color="#5A8DEE">
                    Purchase Overview
                  </Typography>

                              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                                <Button size="small" variant="outlined" onClick={() => handleViewPurchase()} startIcon={<VisibilityIcon />} sx={{ borderColor: "#1890ff", color: "#1890ff" }}>View</Button>
                                <Button size="small" variant="outlined" onClick={() => handleDownloadPurchase()} startIcon={<DownloadIcon />} sx={{ borderColor: "#1890ff", color: "#1890ff" }}>Download</Button>
                              </Box>

                              {purchaseChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={purchaseChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="amount" fill="#1890ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" mt={4}>
                      <BarChartIcon sx={{ fontSize: 40, color: "#1890ff" }} />
                      <Typography mt={1}>No purchase data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Low Stock Chart / List */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  border: "1px solid #ff7a45",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography fontWeight={600} mb={2} color="#ff7a45">
                    Low Stock Products
                  </Typography>

                  <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                    <Button size="small" variant="outlined" onClick={() => handleViewLowStock()} startIcon={<VisibilityIcon />} sx={{ borderColor: "#ff7a45", color: "#ff7a45" }}>View</Button>
                    <Button size="small" variant="outlined" onClick={() => handleDownloadLowStock()} startIcon={<DownloadIcon />} sx={{ borderColor: "#ff7a45", color: "#ff7a45" }}>Download</Button>
                  </Box>

                  {lowStockData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={lowStockData} margin={{ right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="product_name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="stock" fill="#ff7a45" />
                        </BarChart>
                      </ResponsiveContainer>

                      <Box mt={2} maxHeight={180} sx={{ overflowY: "auto" }}>
                        {lowStockData.map((p) => (
                          <Box key={p.id} display="flex" justifyContent="space-between" alignItems="center" p={1} borderBottom="1px solid #eee">
                            <Box>
                              <Typography fontWeight={600}>{p.product_name}</Typography>
                              <Typography variant="body2">SKU: {p.sku || "-"}</Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography color="error">{p.stock}</Typography>
                              <Typography variant="caption">Reorder: {p.reorder_level || p.min_stock || 0}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Box textAlign="center" mt={4}>
                      <Typography mt={1}>No low-stock items</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          </Box>

          {/* Tabbed Data Tables Section */}
          <Card sx={{ borderRadius: 2, mb: 4 }}>
            <Tabs value={tabIndex} onChange={(e, idx) => setTabIndex(idx)}>
              <Tab label="Sales Data" />
              <Tab label="Products Data" />
              <Tab label="Purchase Data" />
              <Tab label="Low Stock Products" />
            </Tabs>

            <TabPanel value={tabIndex} index={0}>
              <Typography fontWeight={600} mb={2}>Sales Transactions</Typography>
              {salesData.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell><strong>Invoice #</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="right"><strong>Total</strong></TableCell>
                        <TableCell><strong>Payment Method</strong></TableCell>
                        <TableCell><strong>Payment Status</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesData.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.invoice_no}</TableCell>
                          <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">${parseFloat(sale.total || 0).toFixed(2)}</TableCell>
                          <TableCell>{sale.payment_method || "-"}</TableCell>
                          <TableCell>{sale.payment_status || "-"}</TableCell>
                          <TableCell>{sale.status || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No sales data available</Typography>
              )}
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
              <Typography fontWeight={600} mb={2}>Product Inventory</Typography>
              {productsData.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell><strong>Product Name</strong></TableCell>
                        <TableCell><strong>SKU</strong></TableCell>
                        <TableCell align="right"><strong>Cost Price</strong></TableCell>
                        <TableCell align="right"><strong>Selling Price</strong></TableCell>
                        <TableCell align="right"><strong>Stock</strong></TableCell>
                        <TableCell><strong>Tax Rate</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productsData.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.sku || "-"}</TableCell>
                          <TableCell align="right">${parseFloat(product.cost_price || 0).toFixed(2)}</TableCell>
                          <TableCell align="right">${parseFloat(product.selling_price || 0).toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: product.stock <= product.reorder_level ? "red" : "green" }}>
                            {parseFloat(product.stock || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>{product.tax_rate || 0}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No product data available</Typography>
              )}
            </TabPanel>

            <TabPanel value={tabIndex} index={2}>
              <Box display="flex" gap={1} mb={2}>
                <Button size="small" variant="outlined" onClick={() => handleDownloadPurchase()} startIcon={<DownloadIcon />} sx={{ borderColor: "#1890ff", color: "#1890ff" }}>
                  Download All
                </Button>
              </Box>
              <Typography fontWeight={600} mb={2}>Purchase Orders</Typography>
              {purchaseRawData.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell><strong>PO Number</strong></TableCell>
                        <TableCell><strong>Purchase Date</strong></TableCell>
                        <TableCell><strong>Supplier</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                        <TableCell align="center"><strong>Items</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseRawData.map((purchase) => (
                        <TableRow key={purchase.po_number}>
                          <TableCell>{purchase.po_number}</TableCell>
                          <TableCell>{purchase.purchase_date}</TableCell>
                          <TableCell>{purchase.supplier_name || "-"}</TableCell>
                          <TableCell align="right">${parseFloat(purchase.amount || 0).toFixed(2)}</TableCell>
                          <TableCell align="center">{purchase.items || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No purchase data available</Typography>
              )}
            </TabPanel>

            <TabPanel value={tabIndex} index={3}>
              <Box display="flex" gap={1} mb={2}>
                <Button size="small" variant="outlined" onClick={() => handleDownloadLowStock()} startIcon={<DownloadIcon />} sx={{ borderColor: "#ff7a45", color: "#ff7a45" }}>
                  Download Report
                </Button>
              </Box>
              <Typography fontWeight={600} mb={2}>Low Stock Alert</Typography>
              {lowStockData.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#ffe6e6" }}>
                      <TableRow>
                        <TableCell><strong>Product Name</strong></TableCell>
                        <TableCell><strong>SKU</strong></TableCell>
                        <TableCell align="right"><strong>Current Stock</strong></TableCell>
                        <TableCell align="right"><strong>Reorder Level</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockData.map((product) => (
                        <TableRow key={product.id} sx={{ backgroundColor: "#fff5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>{product.product_name}</TableCell>
                          <TableCell>{product.sku || "-"}</TableCell>
                          <TableCell align="right" sx={{ color: "error.main", fontWeight: 600 }}>{parseFloat(product.stock || 0).toFixed(2)}</TableCell>
                          <TableCell align="right">{product.reorder_level || product.min_stock || 0}</TableCell>
                          <TableCell align="right">${parseFloat(product.selling_price || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">No low-stock items</Typography>
              )}
            </TabPanel>
          </Card>

          {/* Recent Reports Section */}
          <Card sx={{ borderRadius: 2, mb: 4 }}>
            <CardContent>
              <Typography fontWeight={600} mb={2} sx={{color: isDark ? "#fff" : "#415a77"}}>
                Recent Reports
              </Typography>

              {recentReports.map((report) => (
                <Box
                  key={report.id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  border="1px solid grey"
                  mb={1}
                  
                  borderRadius={1}
                >
                  <Box display="flex" alignItems="center" gap={2} sx={{color: isDark ? "#fff" : "#415a77"}}>
                    <DescriptionIcon />
                    <Box>
                      <Typography fontWeight={600} sx={{color: isDark ? "#fff" : "#415a77"}}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2">{report.desc}</Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{color: isDark ? "#fff" : "#415a77"}}
                      onClick={() => handleViewReport(report)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{color: isDark ? "#fff" : "#415a77"}}
                      onClick={() => handleDownloadReport(report)}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedReport ? selectedReport.title : "Report"} Details
        </DialogTitle>
        <DialogContent>
          {viewData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={viewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={
                    selectedReport?.type === "sales"
                      ? "date"
                      : "name"
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedReport?.type === "sales" ? (
                  <Line type="monotone" dataKey="sales" stroke="#6ca0fe" />
                ) : (
                  <Line type="monotone" dataKey="value" stroke="#52c41a" />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography>No data available for this report</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedReport && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleDownloadReport(selectedReport);
                setViewDialogOpen(false);
              }}
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Toast show={!!toastMessage} message={toastMessage} type={toastType} />
    </Box>
  );
};

export default Reports;
