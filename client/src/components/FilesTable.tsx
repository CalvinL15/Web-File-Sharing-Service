import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import uploadFile from '../actions/uploadFile';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#61dafb',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 18,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const DialogTitleWithExitButton = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function FilesTable(props: { files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>> }) {
  const { files, setFiles } = props;

  const handleDelete = (file: File) => {
    setFiles(files.filter(f => f !== file));
  };

  const [hash, setHash] = React.useState('');
  const [filename, setFilename] = React.useState('');

  const handleUpload = async (file: File) => {
    const res: any = await uploadFile(file);
    setHash(res.hashValue);
    setFilename(res.fileName);
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
        <Table aria-label="customized table" data-testid="result-table">
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
                  <Button onClick={() => handleUpload(f)}>Upload</Button>
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
        maxWidth='md'
      >
        <DialogTitleWithExitButton id="customized-dialog-title" onClose={handleCloseDialog}>
          Download URL
        </DialogTitleWithExitButton>
        <DialogContent dividers sx={{ overflow: 'auto' }}>
          <Typography>
            You can access the link provided below to download the file 
            <span style={{ "fontWeight": "bold" }}>
              {" " + filename}
            </span>
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