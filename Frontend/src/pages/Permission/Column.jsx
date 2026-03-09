import { Button,Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export const Column = [
    { id: "name", label: "Permission Name" },
  
    {
      id: "created_at",
      label: "Created Date",
      render: (row) => (
        <span style={{ fontSize: "14px", color: "#415a77" }}>
          {row?.created_at?.split("T")[0]}
          <br />
          {row?.created_at?.split("T")[1]}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.permissionId)} sx={{
      minWidth: "30px",
      width: "30px",
      height: "30px",
      padding: "0",
      borderRadius: "50%",
      border: "1px solid #2196F3",
      backgroundColor: "#D6EAF8",
      color: "#1565C0"
    }}>
             <EditIcon sx={{ fontSize: 16 }}/>
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.permissionId)} sx={{
      minWidth: "30px",
      width: "30px",
      height: "30px",
      padding: "0",
      borderRadius: "50%",
      border: "1px solid #F44336",
      backgroundColor: "#FAD4D4",
      color: "#D32F2F"
    }}
  >
    <DeleteIcon sx={{ fontSize: 16 }}/>
          
          </Button>
        </Box>
      ),
    }
  ];