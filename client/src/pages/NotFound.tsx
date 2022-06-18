import React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import astronaut from '../img/lost-in-space.png';

export default function NotFound(){
  return (
    <div>
        <img src={astronaut} alt="logo" height='300vmin' width='300vmin'></img>
        <h1 style={{'marginTop': '2vmin'}}>This page is lost in space...</h1>
        <Button 
          variant="contained" 
          color="success" 
          size="large" 
          sx={{marginLeft: '20vmin'}}
        >
          <Link to="/" style={{ 'color': 'lightgray', 'fontWeight': 'bold' }}>
            Go back to the homepage
          </Link>
        </Button>
    </div>
  );
};