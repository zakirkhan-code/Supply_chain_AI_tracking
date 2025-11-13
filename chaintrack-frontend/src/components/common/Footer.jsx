import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              🔗 ChainTrack
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Blockchain-powered supply chain tracking system ensuring transparency,
              authenticity, and real-time monitoring of products.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/dashboard" color="inherit" underline="hover">
                Dashboard
              </Link>
              <Link href="/products" color="inherit" underline="hover">
                Products
              </Link>
              <Link href="/shipments" color="inherit" underline="hover">
                Shipments
              </Link>
              <Link href="/analytics" color="inherit" underline="hover">
                Analytics
              </Link>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover">
                Documentation
              </Link>
              <Link href="#" color="inherit" underline="hover">
                API Reference
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Support
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Privacy Policy
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <IconButton
                size="small"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                href="https://github.com"
                target="_blank"
              >
                <Github size={18} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                href="https://twitter.com"
                target="_blank"
              >
                <Twitter size={18} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                href="https://linkedin.com"
                target="_blank"
              >
                <Linkedin size={18} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                href="mailto:support@chaintrack.com"
              >
                <Mail size={18} />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Email: support@chaintrack.com
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            mt: 4,
            pt: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 ChainTrack. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Built with ❤️ using React, Ethereum & IPFS
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;