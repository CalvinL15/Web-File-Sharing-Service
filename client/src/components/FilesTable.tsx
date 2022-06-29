import React from 'react';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import StyledDialogTitle from './StyledDialogTitle';
import { StyledTableCell, StyledTableRow } from './StyledTableElements';
import uploadFile from '../actions/uploadFile';

export default function FilesTable(props: { files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>> }) {
  const { files, setFiles } = props;

  const handleDelete = (file: File) => {
    setFiles(files.filter(f => f !== file));
  };

  const [hash, setHash] = React.useState('');
  const [filename, setFilename] = React.useState('');

  const [loading, setLoading] = React.useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    const res: any = await uploadFile(file);
    if (res.hasOwnProperty("errMsg")) {
      return (
        <>
          {res.errMsg} Please refresh this page...
        </>
      );
    }
    setHash(res.hashValue);
    setFilename(res.fileName);
    setLoading(false);
    setOpenDialog(true);
    handleDelete(file);
  }

  const [openDialog, setOpenDialog] = React.useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // if (!files.length) return null;

  return (
    <>
      <TableContainer component={Paper} sx={{ marginTop: "calc(5px + 2vmin)", width: "100vmin" }}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>File Name</StyledTableCell>
              <StyledTableCell>File Size</StyledTableCell>
              <StyledTableCell>File Type</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((f: File) => (
              <StyledTableRow key={f.name + f.size + f.type}>
                <StyledTableCell component="th" scope="row">
                  {f?.name}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {f?.size}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {f?.type ? f?.type : "." + f?.name.split(".")[1]}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <LoadingButton
                    loading={loading}
                    loadingIndicator={<Typography sx={{ fontSize: '2vmin' }}>Uploading a file...</Typography>} 
                    onClick={() => handleUpload(f)}
                  >
                    Upload
                  </LoadingButton>
                  <Button onClick={() => handleDelete(f)}>Delete</Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="customized-dialog-title"
        open={openDialog}
        maxWidth='lg'
      >
        <StyledDialogTitle id="customized-dialog-title" onClose={handleCloseDialog}>
          Download URL
        </StyledDialogTitle>
        <DialogContent dividers sx={{ overflow: 'auto' }}>
          
          <Typography>
            <b>Upload successful!</b> You can access the link provided below to download the file <b>{filename}</b>
          </Typography>
          
          <Typography sx={{ display: 'inline-block', fontWeight: 'bold', margin: '10px' }}>
            http://localhost:3000/download/{hash}
          </Typography>
          <Alert severity="warning">Important: You will only get the download URL this time only!</Alert>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog}>
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}