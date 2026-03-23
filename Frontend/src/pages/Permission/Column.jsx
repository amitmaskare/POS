import { Button,Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export const getColumns = (isDark) => [
  {
    id: "name",
    label: "Permission Name",
    render: (row) => (
      <span style={{ color: isDark ? "#fff" : "#415A77", fontWeight: 600 ,fontSize:"12.9px"}}>
        {row.name}
      </span>
    )
  },
  
    {
      id: "created_at",
      label: "Created Date",
      render: (row) => {
        if (!row?.created_at) return "-";
    
        const dateObj = new Date(row.created_at); 
        const date = dateObj.toLocaleDateString(); 
        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // e.g., "10:28:08"
    
        return (
          <span style={{ fontSize: "14px" }}>
            {date} <br /> {time}
          </span>
        );
      },
    },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.permissionId)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.permissionId)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];