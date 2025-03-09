import React from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material';
import { InventoryItem, InventoryBatch } from '../../types/inventory';

interface StockAlertsProps {
  lowStockItems: InventoryItem[];
  expiringBatches: InventoryBatch[];
}

export default function StockAlerts({ lowStockItems, expiringBatches }: StockAlertsProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Low Stock Alert</AlertTitle>
          <List dense>
            {lowStockItems.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Typography variant="body2" component="span">
                      Current stock is below reorder point ({item.reorderPoint} units)
                    </Typography>
                  }
                />
                <Chip
                  label="Low Stock"
                  color="warning"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {expiringBatches.length > 0 && (
        <Alert severity="error">
          <AlertTitle>Expiring Items Alert</AlertTitle>
          <List dense>
            {expiringBatches.map((batch) => (
              <ListItem key={batch.id}>
                <ListItemText
                  primary={`Batch #${batch.batchNumber}`}
                  secondary={
                    <Typography variant="body2" component="span">
                      Expires on {batch.expiryDate.toDate().toLocaleDateString()}
                      {batch.quantity > 0 && ` - ${batch.quantity} units remaining`}
                    </Typography>
                  }
                />
                <Chip
                  label="Expiring Soon"
                  color="error"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  );
} 