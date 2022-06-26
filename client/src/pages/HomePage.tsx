import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import FilesTable from '../components/FilesTable';
import uploadFiles from '../actions/uploadFiles';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Homepage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [openError, setOpenError] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const [fileUploadMsg, setFileUploadMsg] = React.useState("Select file(s) to be uploaded...");

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  useEffect(() => {
    if(files.length >= 5){
      setFileUploadMsg("Maximum of 5 files can be queued for upload!");
    }
  }, [files]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) {
      return;
    }
    const maxFilesAllowed = 5 - files.length;

    for(let i = 0; i<e.target.files.length; i++){
      if (i === maxFilesAllowed) break;
      const file = e.target.files[i];
      const fileIdentifier = file.name + file.size + file.type;
      if(file.size > 10 * 1024 * 1024){
        console.log(file.size);
        setErrMsg("Maximum size for a file: 10 MiB!");
        setOpenError(true);
      } else if(files.some(f => (f.name + f.size + f.type) === fileIdentifier)){
        setErrMsg("No duplicate file(s)!");
        setOpenError(true);
      } else {
        setErrMsg("");
        setFiles(files => [...files, file]);
      }
    }
    e.target.files = null;
  };

  const handleUploads = async (files: File[]) => {
    const res: any = await uploadFiles(files);
    console.log(res);
  }

  return (
    <Grid justifyContent="center" alignItems="center">
        <Grid sx={{minWidth: "100vmin"}}>
          <Button 
            variant="outlined" 
            component="label"
            startIcon={ <UploadFileIcon/> }
            size="large"
            color="success"
            sx={{  minWidth: "100vmin", height: "10vmin", fontWeight: "bold", color: "#6A8A26", marginTop: "10vmin" }}
            disabled={files.length >= 5}
          >
            {fileUploadMsg}
            <input type="file" multiple hidden onChange={handleFileUpload}></input>
          </Button>
        </Grid>
        <Grid sx={{minWidth: "100vmin"}}>
          <FilesTable files={files} setFiles={setFiles}/>
        </Grid>

        { files.length ? (
          <Grid>
            <Button 
              variant="outlined" 
              component="label"
              size="large"
              sx={{ 
                width: "80vmin", 
                height: "10vmin", 
                marginLeft: "10vmin",
                fontWeight: "bold", 
                color: "#6A8A26", 
                marginTop: "calc(10px + 2vmin)",
                marginBottom: "calc(10px + 2vmin)"
              }}
              onClick={() => (handleUploads(files))}
            >
              Upload all files!
            </Button>
          </Grid>) : null }
        <Snackbar open={openError} autoHideDuration={6000} onClose={handleErrorClose}>
          <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100vmin', fontWeight: 'bold', alignSelf: 'right' }}>
            {errMsg}
          </Alert>
        </Snackbar>
    </Grid>
  );
};