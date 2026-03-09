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
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Header from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import {
  getSalesReport,
  getTransactionList,
  getSalesList,
  getProductList,
  calculateStats,
  getSalesChartData,
  getProductPerformanceData,
  downloadReport,
  getRecentReports,
} from "../../services/reportService";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

const Reports = () => {
  const [statsData, setStatsData] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [productChartData, setProductChartData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewData, setViewData] = useState([]);

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
      const [salesRes, productsRes] = await Promise.all([
        getSalesList(),
        getProductList(),
      ]);

      // Calculate stats
      if (salesRes.status && salesRes.data) {
        const stats = calculateStats(salesRes.data);
        const chartData = getSalesChartData(salesRes.data);

        setStatsData([
          {
            title: "Total Sales",
            value: `$${stats.totalSales}`,
            change: "+12.5%",
            color: "#6ca0fe",
            icon: (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "#e3f2fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PointOfSaleOutlinedIcon sx={{ fontSize: 26, color: "#1565c0" }} />
              </Box>
            ),
          },
          {
            title: "Transactions",
            value: stats.transactions.toString(),
            change: "+4.2%",
            color: "green",
            icon: (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "#ede7f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReceiptLongOutlinedIcon
                  sx={{ fontSize: 26, color: "#5e35b1" }}
                />
              </Box>
            ),
          },
          {
            title: "Avg Transaction",
            value: `$${stats.avgTransaction}`,
            change: "+3.1%",
            color: "#ffc44d",
            icon: (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "#eceff1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUpOutlinedIcon
                  sx={{ fontSize: 26, color: "#455a64" }}
                />
              </Box>
            ),
          },
          {
            title: "Top Product",
            value: stats.topProduct,
            sub: "15 sold",
            color: "#6ca0fe",
            icon: (
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "#e0f2f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Inventory2OutlinedIcon
                  sx={{ fontSize: 26, color: "#00897b" }}
                />
              </Box>
            ),
          }
        ]);

        setSalesChartData(chartData);
      }

      // Set product chart data
      if (productsRes.status && productsRes.data) {
        const productData = getProductPerformanceData(productsRes.data);
        setProductChartData(productData);
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

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header
        title="Reports"
        subtitle="Analytics and business insights"
        actions={[
          {
            label: "Today",
            color: "#fff",
            variant: "contained",
          },
          {
            label: "Custom Range",
            variant: "contained",
            color: "#fff",
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

          {/* Charts */}
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
        color="#415A77"
      >
                    Sales Overview
                  </Typography>

                  {salesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
                          formatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Bar dataKey="sales" fill="#415A77" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" mt={6}>
                      <BarChartIcon sx={{ fontSize: 50, color: "#94a3b8" }} />
                      <Typography mt={1} color="text.secondary">
                        No sales data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

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
        color="#415A77"
      >
                    Product Performance
                  </Typography>

                  {productChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={productChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Bar dataKey="value" fill="#52c41a" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" mt={6}>
                      <TrendingUpIcon sx={{ fontSize: 50, color: "#415A77" }} />
                      <Typography mt={1} color="#415A77" fontWeight={600}>
                        No product data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Reports Section */}
          <Card sx={{ borderRadius: 2, mb: 4 }}>
            <CardContent>
              <Typography fontWeight={600} mb={2} color="#415A77">
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
                  <Box display="flex" alignItems="center" gap={2} color="#415A77">
                    <DescriptionIcon />
                    <Box>
                      <Typography fontWeight={600} color="#415A77">
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
                      sx={{ borderColor: "#5A8DEE", color: "#5A8DEE" }}
                      onClick={() => handleViewReport(report)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{ borderColor: "#5A8DEE", color: "#5A8DEE" }}
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
        <DialogTitle sx={{color:"#415a77",fontWeight:600}}>
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
          <Button sx={{backgroundColor:"#e53935",color:"#fff"}} onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedReport && (
            <Button
              variant="contained"
              sx={{backgroundColor:"#415a77"}}
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
