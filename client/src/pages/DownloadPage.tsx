import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { useParams } from "react-router-dom";
import getFileInfo from '../actions/getFileInfo';
import Typography from '@mui/material/Typography';

export default function DownloadPage() {
  const fileId: String | undefined = useParams().id;
  const [file, setFile] = useState<any>({});
  useEffect(() => {
    const fetchData = async () => {
      const dt: any = await getFileInfo(fileId);
      setFile(dt);
      console.log(file);
    }
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (Object.keys(file).length === 0) {
    return (
      <>
        <Typography variant='h4'>
          Invalid Download URL...
        </Typography>
        <Alert severity="error" sx={{ margin: 4, fontWeight: 'bold' }}>
          There is no file linked to this URL!
        </Alert>
      </>
    );
  }

  return (
    <>
    Filename: {file.file_name}
    </>
  );
};