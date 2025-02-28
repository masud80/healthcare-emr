const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createSampleNotifications() {
  try {
    // First get the admin user's ID
    console.log('Searching for admin user...');
    const adminUser = await db.collection('users')
      .where('email', '==', 'admin@healthcare.com')
      .get();
    
    if (adminUser.empty) {
      console.log('Admin user not found');
      return;
    }

    const userData = adminUser.docs[0].data();
    const adminUserId = userData.uid; // Use the uid field instead of document ID
    console.log('Found admin user:', {
      uid: adminUserId,
      email: userData.email,
      role: userData.role
    });

    const notificationsRef = db.collection('AlertsNotifications');

    // Delete any existing notifications for this user
    console.log('Checking for existing notifications...');
    const existingNotifications = await notificationsRef
      .where('userId', '==', adminUserId)
      .get();
    
    console.log('Found', existingNotifications.size, 'existing notifications');
    
    const deletePromises = existingNotifications.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log('Deleted existing notifications');

    // Create sample notifications
    const notifications = [
      {
        userId: adminUserId,
        type: 'FACILITY_ASSIGNMENT',
        title: 'New Facility Assignment',
        message: 'You have been assigned to Central Hospital as an administrator',
        status: 'unread',
        createdAt: admin.firestore.Timestamp.now(),
        metadata: {
          facilityId: 'facility123',
          facilityName: 'Central Hospital'
        },
        actionLink: '/facilities/facility123'
      },
      {
        userId: adminUserId,
        type: 'NEW_MESSAGE',
        title: 'New Message from Dr. Smith',
        message: 'Review needed for updated COVID-19 protocols',
        status: 'unread',
        createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        metadata: {
          threadId: 'thread123',
          senderName: 'Dr. Smith'
        },
        actionLink: '/messaging/thread123'
      },
      {
        userId: adminUserId,
        type: 'SYSTEM_ALERT',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight at 2 AM EST',
        status: 'unread',
        createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        metadata: {
          maintenanceId: 'maint123',
          severity: 'info'
        }
      },
      {
        userId: adminUserId,
        type: 'USER_REQUEST',
        title: 'New User Registration',
        message: 'Dr. Jane Wilson has requested access to the system',
        status: 'unread',
        createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        metadata: {
          requestId: 'req123',
          userEmail: 'jane.wilson@healthcare.com'
        },
        actionLink: '/admin/users/pending'
      },
      {
        userId: adminUserId,
        type: 'AUDIT_ALERT',
        title: 'Failed Login Attempts',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100',
        status: 'unread',
        createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        metadata: {
          ipAddress: '192.168.1.100',
          attempts: 5,
          severity: 'warning'
        },
        actionLink: '/audit'
      }
    ];

    // Add all notifications
    console.log('Creating new notifications...');
    for (const notification of notifications) {
      const docRef = await notificationsRef.add(notification);
      console.log('Added notification:', {
        title: notification.title,
        id: docRef.id,
        userId: notification.userId,
        status: notification.status
      });
    }

    // Verify notifications were created
    const verifyNotifications = await notificationsRef
      .where('userId', '==', adminUserId)
      .where('status', '==', 'unread')
      .get();
    
    console.log('Verification - Found', verifyNotifications.size, 'unread notifications for user');

    console.log('Successfully created sample notifications');
  } catch (error) {
    console.error('Error creating notifications:', error);
    console.error('Error details:', error.message);
  }
}

createSampleNotifications(); 