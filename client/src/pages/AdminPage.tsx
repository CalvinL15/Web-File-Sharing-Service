import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import getAllRequests from '../actions/getAllRequests';
import processRequest from '../actions/processRequest';
import IRequest from '../interfaces/requests';
import { StyledTableCell, StyledTableRow } from '../components/StyledTableElements';

export default function AdminPage() {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(0);
  const [acceptSnackbar, setAcceptSnackbar] = useState<boolean>(false);
  const [declineSnackbar, setDeclineSnackbar] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      const res: any = await getAllRequests();
      if (res.hasOwnProperty('err_msg')) {
        return (
          <>
            {res.errMsg} Please refresh this page...
          </>
        );
      }
      setRequests(res);
    }
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAcceptRequest = async (r: IRequest) => {
    setLoading(true);
    const res: any = await processRequest(r.request_id, r.request_type, 'acc', r.file_id);
    if (res.hasOwnProperty('err_msg')) {
      return (
        <>
          {res.errMsg} Please refresh this page...
        </>
      );
    }
    setLoading(false);
    setRequests(requests.filter(req => req !== r));
    setAcceptSnackbar(true);
  }

  const handleDeclineRequest = async (r: IRequest) => {
    const res: any = await processRequest(r.request_id, r.request_type, 'dec', r.file_id);
    if (res.hasOwnProperty('err_msg')) {
      return (
        <>
          {res.errMsg} Please refresh this page...
        </>
      );
    }
    setRequests(requests.filter(req => req !== r));
    setDeclineSnackbar(true);
  }

  const handleDeclineSnackbarClose = () => {
    setDeclineSnackbar(false);
  }

  const handleAcceptSnackbarClose = () => {
    setAcceptSnackbar(false);
  }
  return (
    <>
      <Typography sx={{ fontWeight: 'bold', fontSize: '5vmin', marginTop: "7.5vmin" }}>
        Requests Table
      </Typography>
      <TableContainer component={Paper} sx={{ marginTop: "calc(5px + 2vmin)", width: "100vmin" }}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ width: '35%' }}>Request Created Time</StyledTableCell>
              <StyledTableCell sx={{ width: '20%' }}>Requested Filename</StyledTableCell>
              <StyledTableCell sx={{ width: '15%' }}>Request Type</StyledTableCell>
              <StyledTableCell sx={{ width: '20%' }}>Request Reason</StyledTableCell>
              <StyledTableCell sx={{ width: '15%' }} align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0 ? requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : requests)
              .map((r: IRequest) => (
              <StyledTableRow key={r.request_id}>
                <StyledTableCell component="th" scope="row">
                  <Typography>
                    {(new Date(r.request_created_time.replace(' ', 'T'))).toString().replace('GMT+0200 (Central European Summer Time)', 'GMT+02 (CEST)')}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <Typography>
                    {r?.file_name}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <Typography>
                    {r?.request_type === 0 ? "Block" : "Unblock"}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  <Typography>
                    {r?.request_reason}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <LoadingButton
                    loading={loading}
                    loadingIndicator={
                      <Typography sx={{ fontSize: '2vmin' }}>loading...</Typography>
                    }
                    onClick={() => handleAcceptRequest(r)}  
                  >
                    Accept
                  </LoadingButton>
                  <Button onClick={() => handleDeclineRequest(r)}>
                    Decline
                  </Button>
                  {/* <LoadingButton
                    loading={loading}
                    loadingIndicator={<Typography sx={{ fontSize: '2vmin' }}>Uploading a file...</Typography>} 
                    onClick={() => handleUpload(f)}
                  >
                    Upload
                  </LoadingButton> */}
                  {/* <Button onClick={() => handleDelete(r)}>Delete</Button> */}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={requests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Snackbar 
        open={declineSnackbar} 
        autoHideDuration={6000} 
        onClose={handleDeclineSnackbarClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleDeclineSnackbarClose} severity="warning" sx={{ width: '100vmin', fontWeight: 'bold' }}>
          Request declined!
        </Alert>
      </Snackbar>
      <Snackbar 
        open={acceptSnackbar} 
        autoHideDuration={6000} 
        onClose={handleAcceptSnackbarClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleAcceptSnackbarClose} severity="success" sx={{ width: '100vmin', fontWeight: 'bold' }}>
          Request accepted!
        </Alert>
      </Snackbar>
    </>
  );
};