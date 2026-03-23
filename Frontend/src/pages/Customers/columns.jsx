import { Button, Box } from "@mui/material";

export const columns = [
  {
    id: "customer",
    label: "Customer",
    render: (row) => (
      <Box>
        <div style={{ fontWeight: 600 }}>{row.name}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {row.phone}
        </div>
      </Box>
    )
  },

  {
    id: "contact_info",
    label: "Contact Info",
    render: (row) => (
      <Box>
        <div style={{ fontSize: "13px" }}>{row.email || "-"}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {row.address || "-"}
        </div>
      </Box>
    )
  },

  {
    id: "status_actions",
    label: "Status",
    render: (row, extra) => (
      <Box display="flex" flexDirection="column" gap={1}>
        
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: row.status === "active" ? "#16a34a" : "#dc2626",
            color: "#fff",
            fontSize: "12px",
            width: "fit-content"
          }}
        >
          {row.status}
        </span>

        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => extra?.edit(row?.id)}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => extra?.deleteItem(row?.id)}
          >
            Delete
          </Button>
        </Box>

      </Box>
    )
  }
];