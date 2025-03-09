import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import './NotificationBell.css';

const modernStyles = {
  iconButton: {
    color: '#00FFD0',
    '&:hover': {
      background: 'rgba(0, 255, 208, 0.1)',
    },
  },
  badge: {
    '& .MuiBadge-badge': {
      background: 'linear-gradient(135deg, #00FFD0 0%, #00BFA5 100%)',
      color: '#0A192F',
    },
  },
  menu: {
    '& .MuiPaper-root': {
      background: 'linear-gradient(135deg, rgba(16, 20, 24, 0.95) 0%, rgba(0, 48, 46, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 255, 208, 0.1)',
      boxShadow: '0 4px 30px rgba(0, 255, 208, 0.1)',
      color: '#fff',
    },
  },
  notificationItem: {
    borderBottom: '1px solid rgba(0, 255, 208, 0.1)',
    '&:hover': {
      background: 'rgba(0, 255, 208, 0.05)',
    },
    '&.action': {
      borderLeft: '4px solid #00FFD0',
    },
    '&.view': {
      borderLeft: '4px solid #00BFA5',
    },
  },
};

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const currentUser = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.uid && !currentUser?.id) {
      console.log('No user ID found in currentUser:', currentUser);
      return;
    }

    const userId = currentUser.uid || currentUser.id;
    console.log('Current user details:', {
      uid: currentUser.uid,
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role
    });
    console.log('Fetching notifications for user:', userId);

    // Subscribe to notifications
    const notificationsRef = collection(db, 'AlertsNotifications');
    console.log('Creating query for notifications...');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('status', '==', 'unread'),
      orderBy('createdAt', 'desc')
    );

    console.log('Setting up snapshot listener...');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Received notification snapshot:', {
        empty: snapshot.empty,
        size: snapshot.size,
        docs: snapshot.docs.map(doc => ({
          id: doc.id,
          userId: doc.data().userId,
          status: doc.data().status,
          title: doc.data().title
        }))
      });
      const notificationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Setting notifications state with:', notificationList);
      setNotifications(notificationList);
    }, (error) => {
      console.error('Error in notification snapshot:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    });

    return () => {
      console.log('Cleaning up notification listener');
      unsubscribe();
    };
  }, [currentUser]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
    handleClose();
  };

  const handleMarkComplete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      const notificationRef = doc(db, 'AlertsNotifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as complete:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="notification-bell">
      <IconButton
        sx={modernStyles.iconButton}
        onClick={handleClick}
        className="notification-button"
      >
        <Badge 
          badgeContent={notifications.length} 
          sx={modernStyles.badge}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className="notification-menu"
        sx={modernStyles.menu}
        PaperProps={{
          className: 'notification-menu-paper'
        }}
      >
        <Box className="notification-header" sx={{ color: '#00FFD0' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(0, 255, 208, 0.1)' }} />
        <List className="notification-list">
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No new notifications" 
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                className={`notification-item ${notification.type}`}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {notification.message}
                      </Typography>
                      <Typography component="span" variant="caption" color="textSecondary">
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
                <Button
                  className="mark-complete-button"
                  onClick={(e) => handleMarkComplete(notification.id, e)}
                  color="primary"
                  size="small"
                >
                  Mark Complete
                </Button>
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </div>
  );
};

export default NotificationBell; 