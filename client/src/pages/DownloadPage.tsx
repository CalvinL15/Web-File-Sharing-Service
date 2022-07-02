import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import { useParams } from "react-router-dom";
import getFileInfo from '../actions/getFileInfo';
import { StyledTableCell } from '../components/StyledTableElements';
import updateLastDownloadDate from '../actions/updateLastDownloadDate';
import createRequest from '../actions/createRequest';

const checkValidSHA256 = (fileId: string | undefined) => {
  // Regular expression to check if string is a SHA256 hash
  if (fileId === undefined) return false;
  const regexExp = /^[a-f0-9]{64}$/gi;
  return regexExp.test(fileId);
}

export default function DownloadPage() {
  const fileId: string | undefined = useParams().id;
  const [loading, setLoading] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [file, setFile] = useState<any>({});
  const [reason, setReason] = useState<string>("");
  const [snackbar, setSnackbar] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");

  useEffect(() => {
    if(checkValidSHA256(fileId)){
      const fetchData = async () => {
        const res: any = await getFileInfo(fileId);
        if (res.hasOwnProperty('err_msg')) {
          return (
            <>
              {res.errMsg} Please refresh this page...
            </>
          );
        }
        setFile(res);
      }
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    // clear snackbar content
    setSnackbar(false);
    setSnackbarMsg("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar(false);
  }

  if (!checkValidSHA256(fileId)) {
    return (
      <>
        <Typography variant='h4'>
          Invalid Download URL...
        </Typography>
        <Alert severity="error" sx={{ margin: 4, fontWeight: 'bold' }}>
          File ID parameter is not a SHA256 string!
        </Alert>
      </>
    );
  }

  if (Object.keys(file).length === 0) {
    return (
      <>
        <Typography variant='h4'>
          Sending a request to the server, please wait...
        </Typography>
      </>
    );
  }

  if (file.hasOwnProperty('invalidId')) {
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

  const toArrayBuffer = (buf: any) => {
    const arrBuffer: ArrayBuffer = new ArrayBuffer(buf.data.length);
    const view = new Uint8Array(arrBuffer);
    for (let i = 0; i < buf.data.length; i++) {
      view[i] = buf.data[i];
    }
    return arrBuffer;
  }

  const handleDownload = async (buf: any) => {
    setLoading(true);
    const data: ArrayBuffer = toArrayBuffer(buf);
    const blob = new Blob([data], {
      'type': file.file_type,
    });
    const link = document.createElement('a');
    link.style.visibility = 'hidden';
    if (link.download !== undefined) {
      link.href = URL.createObjectURL(blob);
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }
    const res: any = await updateLastDownloadDate(file.file_id, new Date().toISOString());
    if (res.hasOwnProperty('err_msg')) {
      return (
        <>
          {res.errMsg} Please refresh this page...
        </>
      );
    }
    setLoading(false);
  }

  const handleCreateRequest = async () => {
    setLoading2(true);
    let requestType: number = 0; // asking the file to be blocked
    if (file.is_file_blocked) requestType = 1;
    const res : any = await createRequest(file.file_id, file.file_name, requestType, reason);
    setLoading2(false);
    setReason('');
    handleClose();
    if (res.hasOwnProperty('errMsg')) {
      return (
        <>
          {res.errMsg} Please refresh this page...
        </>
      );
    }
    setSnackbarMsg(res.successMsg);
    setSnackbar(true);
  }

  return (
    <>
    <Typography sx={{ fontSize: '5vmin' }}>
      {file.file_name}
    </Typography>
    <TableContainer component={Paper} sx={{ margin: "calc(5px + 2vmin)", width: "100vmin" }}>
      <Table aria-label="customized table">
        <TableBody>
          <TableRow>
            <StyledTableCell align="center" colSpan={2} sx={{ border: '1px solid;', backgroundColor: '#6A8A26', fontWeight: 'bold', color: 'white' }}>File Size</StyledTableCell>
            <StyledTableCell align="right" colSpan={2}>{file.file_size}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell align="center" colSpan={2} sx={{ border: '1px solid;', backgroundColor: '#6A8A26', fontWeight: 'bold', color: 'white' }}>Upload date</StyledTableCell>
            <StyledTableCell align="right" colSpan={2}>
              {(new Date(file.file_upload_time.replace(' ', 'T'))).toString().replace('GMT+0200 (Central European Summer Time)', 'GMT+02 (CEST)')}
              </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell align="center" colSpan={2} sx={{ border: '1px solid;', backgroundColor: '#6A8A26', fontWeight: 'bold', color: 'white' }}>File Type (MIME)</StyledTableCell>
            <StyledTableCell align="right" colSpan={2}>{file.file_type}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell align="center" colSpan={2} sx={{ border: '1px solid;', backgroundColor: '#6A8A26', fontWeight: 'bold', color: 'white' }}>Block Status</StyledTableCell>
            <StyledTableCell align="right" colSpan={2}>{file.is_file_blocked ? "Blocked" : "Not blocked"}</StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    <LoadingButton 
      color="success" 
      loading={loading}
      loadingIndicator="Loading..."
      size="large" 
      variant="contained"
      sx={{ width: '100vmin', height: '10vmin', marginBottom: '3vmin', fontWeight: 'bold', fontSize: '3vmin' }}
      startIcon={ <DownloadIcon/> }
      onClick={() => (handleDownload(file.file_data))}
      disabled={file.is_file_blocked}
    >
      { file.is_file_blocked ? "File is blocked." : "Download file" }
    </LoadingButton>
    <Button onClick={() => (handleClickOpen())}>
      Send request to { file.is_file_blocked ? "unblock" : "block" } the file!
    </Button>
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Request <b>{file.file_name}</b> to be { file.is_file_blocked ? "unblocked" : "blocked" }</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide your reason(s) on why this file has to be { file.is_file_blocked ? "unblocked" : "blocked" }!
          </DialogContentText>
          <TextField
            autoFocus
            error={!reason || reason.trim().length === 0}
            helperText="Do not leave this field empty!"
            margin="dense"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            label="Reason(s)..."
            fullWidth
            variant="standard"
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            loading={loading2}
            loadingIndicator="Sending request..." 
            onClick={() => handleCreateRequest()}
          >
            Send
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snackbar} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100vmin', fontWeight: 'bold' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};
