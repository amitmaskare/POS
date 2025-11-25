import React, { useState } from "react";
import { Box } from "@mui/material";
import { FaRegSquarePlus } from "react-icons/fa6";
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from "react-icons/ai";
import { CiFilter } from "react-icons/ci";

/*linked components*/
import Title from "../../components/MainContentComponents/Title";
import ModalLayout from "./Modal";
import TableLayout from "../../components/MainContentComponents/Table";
import Stats from "../../components/MainContentComponents/Stats";
import { statsData } from "./StatsData";
import { columns } from "./columns";
import { rows } from "./rows";




const Products = () => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Products"
        subtitle="Manage your product inventory"
        actions={[
          {
            label: "Add Product",
            icon: <FaRegSquarePlus />,
            variant: "contained",
            bgcolor: "#5A8DEE",
            onClick: () => setOpen(true),
          },
        ]}
      />

      <ModalLayout open={open} onClose={() => setOpen(false)} />


      <Box sx={{ width: "100%", px: 3, py: 2 }}>
        <Stats stats={statsData} />
      </Box>


     
      <TableLayout columns={columns} rows={rows} actionButtons={
      [
        {
          label: "Filter",
          icon: <CiFilter />,
          variant: "outlined",

        },
        {
          label: "Export",
          icon: <AiOutlineCloudDownload />,
          variant: "outlined",

        },
        {
          label: "Import",
          icon: <AiOutlineCloudUpload />,
          variant: "outlined",

        },
      ]
      }/>
    </Box>
  );
};


export default Products;
