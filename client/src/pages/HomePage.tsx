import React from 'react';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import FilesTable from '../components/FilesTable';
import StyledDialogTitle from '../components/StyledDialogTitle';
import { StyledTableCell, StyledTableRow } from '../components/StyledTableElements';
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
  // const [fileUploadMsg, setFileUploadMsg] = React.useState("Select file(s) to be uploaded...");
  const [urls, setURLs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  // useEffect(() => {
  //   if(files.length >= 5){
  //     setFileUploadMsg("Maximum of 5 files can be queued for upload!");
  //   } else {
  //     setFileUploadMsg("Select file(s) to be uploaded...");
  //   }
  // }, [files]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files) {
      return;
    }
    
    for(let i = 0; i<e.target.files.length; i++){
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
    setLoading(true);
    const res: any = await uploadFiles(files);
    if (res.hasOwnProperty("errMsg")) {
      return (
        <>
          {res.errMsg} Please refresh this page...
        </>
      );
    }
    setURLs(res);
    setOpenDialog(true);
    // empty files
    setLoading(false);
    setFiles([]);
  }

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Grid justifyContent="center" alignItems="center">
        <Grid sx={{minWidth: "100vmin"}}>
          <Button 
            variant="outlined" 
            component="label"
            startIcon={ <UploadFileIcon/> }
            size="large"
            color="success"
            sx={{  minWidth: "100vmin", height: "10vh", fontWeight: "bold", color: "#6A8A26", marginTop: "12vmin" }}
            // disabled={files.length >= 5}
          >
              {"Select file(s) to be uploaded..."}
            <input type="file" multiple hidden onChange={handleFileUpload}></input>
          </Button>
        </Grid>
        <Grid sx={{minWidth: "100vmin"}}>
          <FilesTable files={files} setFiles={setFiles}/>
        </Grid>

        { files.length ? (
          <Grid>
            <LoadingButton 
              variant="outlined" 
              component="label"
              loading={loading}
              loadingIndicator="Files uploading, please wait..."
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
            </LoadingButton>
          </Grid>) : null }
        <Snackbar 
          open={openError} 
          autoHideDuration={6000} 
          onClose={handleErrorClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100vmin', fontWeight: 'bold', alignSelf: 'right' }}>
            {errMsg}
          </Alert>
        </Snackbar>
      </Grid>
      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="customized-dialog-title"
        open={openDialog}
        maxWidth='lg'
      >
        <StyledDialogTitle id="customized-dialog-title" onClose={handleCloseDialog}>
          Download URLs
        </StyledDialogTitle>
        <DialogContent dividers sx={{ overflow: 'auto' }}>
          
          <Typography>
            <b>Uploads successful!</b> Below are the filenames and SHA256 hashes of the files that you just uploaded...
          </Typography>
          <Table aria-label="customized table hash" sx={{ marginTop: '3vmin', marginBottom: '3vmin' }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>Filename</StyledTableCell>
                <StyledTableCell>SHA256 Hash</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {urls.map((val: any) => (
              <StyledTableRow key={val.hashValue}>
                <StyledTableCell component="th">
                  <Typography>{val.fileName}</Typography>
                </StyledTableCell>
                <StyledTableCell component="th">
                  <Typography sx={{ overflowWrap: 'break-word' }}>{val.hashValue}</Typography>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            </TableBody>
          </Table>
          Download URL for a file: <b>'http://localhost:3000/download/'</b> + <b>SHA256 value of the file.</b>
          <Alert severity="warning" sx={{ marginTop: '2vmin' }} >Important: You will only get this information this one time only!</Alert>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog}>
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
