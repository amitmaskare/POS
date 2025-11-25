import React from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";

import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import Header from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import { statsData } from "./StatsData";
import { statsData1 } from "./StatsData1";



const Reports = () => {
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



      {/* stats */}
      <Box sx={{ mt: 3 }}>
      <Stats stats={statsData} />;
      </Box>

      {/* grid */}
      <Grid container spacing={3} mb={4} justifyContent={"space-around"}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{

              border: "1px solid #5A8DEE",
              height: 300,
              width:500,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography fontWeight={600} mb={10} color= "#5A8DEE">
                Sales Overview
              </Typography>

              <Box
                textAlign="center"
               
                mt={6}
                color={"black"}
              >
                <BarChartIcon sx={{ fontSize: 50, color: "#6ca0fe" }} />

                <Typography mt={1}>Sales chart would be displayed here</Typography>
                <Typography variant="body2" sx={{color:"black" }}>
                  Integration with chart library needed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{

              border: "1px solid #5A8DEE",
              height: 300,
              width:500,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography fontWeight={600} mb={10} color= "#5A8DEE">
                Product Performance
              </Typography>

              <Box textAlign="center"  mt={6}>
                <TrendingUpIcon sx={{ fontSize: 50, color: "green" }} />

                <Typography mt={1}>
                  Product performance chart would be displayed here
                </Typography>
                <Typography variant="body2" >
                  Integration with chart library needed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RECENT REPORTS */}
      <Card
        sx={{

          borderRadius: 2,
          mb: 4,
        }}
      >
        <CardContent>
          <Typography fontWeight={600} mb={2} color="#5A8DEE">
            Recent Reports
          </Typography>
          {[
            {
              title: "Daily Sales Report",
              desc: "Sales • Generated on 2024-08-30",
            },
            {
              title: "Product Performance",
              desc: "Products • Generated on 2024-08-29",
            },
            {
              title: "Customer Analytics",
              desc: "Customers • Generated on 2024-08-28",
            },
            {
              title: "Inventory Summary",
              desc: "Inventory • Generated on 2024-08-27",
            },
          ].map((r, i) => (
            <Box key={i} display="flex" justifyContent="space-between" alignItems="center" p={2}  border={ "1px solid grey" }>
              <Box display="flex" alignItems="center" gap={2}>
                <DescriptionIcon  />
                <Box>
                  <Typography fontWeight={600} >{r.title}</Typography>
                  <Typography variant="body2">
                    {r.desc}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                <Button variant="outlined" size="small" sx={{borderColor: "#5A8DEE"}}>View</Button>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />}sx={{borderColor: "#5A8DEE"}}>Download</Button>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* GENERATE REPORTS */}
        <Typography fontWeight={600} mb={2} color="#5A8DEE">
          Generate New Report
        </Typography>

        <Stats stats={statsData1} />;
    
    </Box>
  );
};

export default Reports;
