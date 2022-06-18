import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IFile from '../interfaces/IFile';

export default function Homepage() {
  const [filename, setFilename] = React.useState("");
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) {
      return;
    }
    const file: IFile = e.target.files[0];
    setFilename(file.name);
    console.log(file);
  };
  return (
    <Grid>
      <Button 
        variant="outlined" 
        component="label"
        startIcon={ <UploadFileIcon/> }
        sx={ {marginRight: "1rem"} }
      >
        Upload a file!
        <input type="file" hidden onChange={handleFileUpload}></input>
      </Button>
      <Box>
        <Typography>
          {filename}
        </Typography>
      </Box>
    </Grid>
  );
};