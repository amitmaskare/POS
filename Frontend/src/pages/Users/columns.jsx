import { Button,Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
export const columns = [
  {
    id: "name",
    label: "User Info",
    render: (row) => (
      <div style={{ display: "flex", flexDirection: "column", fontSize: "13px", color: "#415a77", gap: "2px" }}>
        {/* Name */}
        <span style={{ fontWeight: 600 }}>{row?.name}</span>
  
        {/* Email */}
        <span style={{ fontSize: "14px", color: "#000" }}>{row?.email}</span>
  
        {/* Role */}
        <span style={{ fontSize: "14px", color: "#2E7D32", fontWeight: 500 }}>{row?.roleName}</span>
      </div>
    ),
  },
  {
    id: "created_at",
    label: "Created At",
    render: (row) => {
      if (!row?.created_at) return "";
      // Split date and time
      const [date, time] = row.created_at.split("T");
      const formattedTime = time.split(".")[0]; // remove .000Z
      return (
        <span style={{ fontSize: "14px", color: "#415a77", lineHeight: 1.4 }}>
          {date} <br />
          {formattedTime}
        </span>
      );
    },
  },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.userId)}sx={{
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

          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.userId)} sx={{
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
 
          <Button
            size="small"
            variant="outlined"
            sx={{
              minWidth: "30px",
              width: "30px",
              height: "30px",
              padding: "0",
              borderRadius: "50%",
              border: "1px solid #009688",
              backgroundColor: "#E0F2F1",
              color: "#00796B",
            }}
            onClick={() => extra?.managePermissions(row?.userId)}
          >
           <SecurityIcon sx={{ fontSize: 16 }} />
          </Button>
        </Box>
      ),
    }
  ];