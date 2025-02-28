// AlertsNotifications Collection Schema
/*
{
  id: string (auto-generated),
  userId: string,
  type: 'action' | 'view',
  title: string,
  message: string,
  status: 'pending' | 'completed',
  createdAt: timestamp,
  actionLink?: string, // Optional link for action notifications
  metadata?: {
    // Additional data specific to the notification type
    facilityId?: string,
    prescriptionId?: string,
    // etc...
  }
}
*/

// ... existing code ... 