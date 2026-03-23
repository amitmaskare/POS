import { Button,Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export const getColumns = (isDark) => [
    { id: "name", label: "Name",
    render: (row) => (
      <span style={{ color: isDark ? "#fff" : "#415A77",textTransform:"capitalize", fontWeight: 600 }}>
        {row.name}
      </span>
    )
       },
  
    {
      id: "created_at",
      label: "Created Date",
      render: (row) => {
        if (!row?.created_at) return "";
        const [date, time] = row.created_at.split("T");       // split at 'T'
        const formattedTime = time.split(".")[0];             // remove .000Z
        return (
          <span style={{ fontSize: "12px", fontWeight:600 }}>
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
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.roleId)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.roleId)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];