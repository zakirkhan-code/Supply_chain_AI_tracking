import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Bell,
  User,
  LogOut,
  Settings,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useWeb3 } from '@hooks/useWeb3';
import { useNotification } from '@hooks/useNotification';
import { formatAddress } from '@utils/helpers';
import { ROLE_NAMES } from '@utils/constants';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, isConnected, connectWallet } = useWeb3();
  const { unreadCount } = useNotification();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifClick = (event) => {
    setNotifAnchor(event.currentTarget);
    navigate('/notifications');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          🔗 ChainTrack
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Wallet Connection */}
          {isConnected ? (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Wallet size={16} />}
              size="small"
            >
              {formatAddress(account)}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Wallet size={16} />}
              size="small"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}

          {/* Notifications */}
          <IconButton color="inherit" onClick={handleNotifClick}>
            <Badge badgeContent={unreadCount} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ROLE_NAMES[user?.role]}
              </Typography>
            </Box>

            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <User size={16} style={{ marginRight: 8 }} />
              Profile
            </MenuItem>

            <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
              <Settings size={16} style={{ marginRight: 8 }} />
              Settings
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: 8 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;