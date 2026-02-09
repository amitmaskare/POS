import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token");

const headers = {
  Authorization: `Bearer ${token}`,
};

// Fetch sales report data
export const getSalesReport = async () => {
  try {
    const response = await axios.get(`${apiUrl}/sale/saleReport`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch transaction list
export const getTransactionList = async () => {
  try {
    const response = await axios.get(`${apiUrl}/sale/transactionList`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch sales list
export const getSalesList = async () => {
  try {
    const response = await axios.get(`${apiUrl}/sale/list`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch product list
export const getProductList = async () => {
  try {
    const response = await axios.get(`${apiUrl}/product/list`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export report as PDF (backend or generate here)
export const downloadReport = async (reportType, data) => {
  try {
    // Generate simple CSV for download
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    throw error;
  }
};

// Helper function to convert JSON to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    ),
  ];

  return csv.join("\n");
};

// Calculate statistics from sales data
export const calculateStats = (sales) => {
  if (!sales || sales.length === 0) {
    return {
      totalSales: 0,
      transactions: 0,
      avgTransaction: 0,
      topProduct: "N/A",
    };
  }

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const transactions = sales.length;
  const avgTransaction = transactions > 0 ? (totalSales / transactions).toFixed(2) : 0;

  return {
    totalSales: totalSales.toFixed(2),
    transactions,
    avgTransaction,
    topProduct: "Multiple", // Can be enhanced with product data
  };
};

// Get sales data for chart
export const getSalesChartData = (sales) => {
  if (!sales || sales.length === 0) return [];

  // Group by date
  const groupedByDate = {};

  sales.forEach((sale) => {
    const date = new Date(sale.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (!groupedByDate[date]) {
      groupedByDate[date] = 0;
    }
    groupedByDate[date] += sale.total || 0;
  });

  return Object.entries(groupedByDate).map(([date, total]) => ({
    date,
    sales: parseFloat(total.toFixed(2)),
  }));
};

// Get product performance data
export const getProductPerformanceData = (products) => {
  if (!products || products.length === 0) return [];

  // Sort by favorite/stock and return top 5
  const sorted = products
    .filter((p) => p.stock_quantity > 0)
    .sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
    .slice(0, 5);

  return sorted.map((product) => ({
    name: product.product_name || "Unknown",
    stock: product.stock_quantity || 0,
    price: product.selling_price || 0,
    value: (product.stock_quantity || 0) * (product.selling_price || 0),
  }));
};

// Get recent reports metadata
export const getRecentReports = () => {
  return [
    {
      id: 1,
      title: "Daily Sales Report",
      type: "sales",
      desc: "Sales • Generated today",
      generatedDate: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      title: "Product Performance",
      type: "products",
      desc: "Products • Generated today",
      generatedDate: new Date().toLocaleDateString(),
    },
    {
      id: 3,
      title: "Customer Analytics",
      type: "customers",
      desc: "Customers • Generated today",
      generatedDate: new Date().toLocaleDateString(),
    },
    {
      id: 4,
      title: "Inventory Summary",
      type: "inventory",
      desc: "Inventory • Generated today",
      generatedDate: new Date().toLocaleDateString(),
    },
  ];
};
