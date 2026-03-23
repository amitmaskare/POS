import { Button, Box } from "@mui/material";

export const columns = [
  {
    id: "card_info",
    label: "Card Info",
    render: (row) => (
      <Box>
        <div style={{ fontWeight: 600 }}>{row.card_number}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {row.card_holder_name}
        </div>
      </Box>
    )
  },

  {
    id: "limits_status",
    label: "Limits / Status",
    render: (row) => (
      <Box>
        <div style={{ fontSize: "13px" }}>
          Members: {row.family_member}
        </div>

        <span
          style={{
            marginTop: "4px",
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: row.status === "active" ? "#16a34a" : "#dc2626",
            color: "#fff",
            fontSize: "12px"
          }}
        >
          {row.status}
        </span>
      </Box>
    )
  },

  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
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
    )
  }
];