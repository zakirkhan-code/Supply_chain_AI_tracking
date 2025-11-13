import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import {
  LayoutDashboard,
  Package,
  Truck,
  QrCode,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROLES } from '@config/config';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: [ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER, ROLES.CUSTOMER] },
    { text: 'Products', icon: <Package size={20} />, path: '/products', roles: [ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER, ROLES.CUSTOMER] },
    { text: 'Shipments', icon: <Truck size={20} />, path: '/shipments', roles: [ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER] },
    { text: 'QR Scanner', icon: <QrCode size={20} />, path: '/scan', roles: [ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER, ROLES.CUSTOMER] },
    { text: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics', roles: [ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER] },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const drawer = (
    <>
      <Toolbar />
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;