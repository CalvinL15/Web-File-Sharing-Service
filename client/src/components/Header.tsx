import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import logo from '../img/tuc-white.png';

export default function Header() {
  return (
    <Box sx={{ flexGrow: 1, position: 'fixed' }}>
      <AppBar position='fixed' sx={{ backgroundColor: '#6A8A26' }}>
        <Toolbar>
          <Grid>
            <img src={logo} alt="logo" height='100vmin' width='140vmin' />
          </Grid>
          <Grid sx={{ borderLeft: '1px solid white', height: '10vmin', padding: '1.5vmin' }}></Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Web File Sharing Service</Typography>
          </Grid>
          <Grid>
            <a href="/home" style={{ 'color': 'white', 'fontSize': '3vmin' }}>Home Page</a>
            <span style={{ 'color': 'white', 'fontSize': '4vmin' }}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <a href="/admin" style={{ 'color': 'white', 'fontSize': '3vmin' }}>Admin Page</a>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
