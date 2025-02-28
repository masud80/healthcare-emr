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
        color="inherit"
        onClick={handleClick}
        className="notification-button"
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        className="notification-menu"
        PaperProps={{
          className: 'notification-menu-paper'
        }}
      >
        <Box className="notification-header">
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <List className="notification-list">
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No new notifications" />
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