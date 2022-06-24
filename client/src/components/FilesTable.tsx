import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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

export default function FilesTable(props: { files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>> }) {
  const { files, setFiles } = props;

  const handleDelete = (file: File) => {
    setFiles(files.filter(f => f !== file));
  };

  const handleUpload = async (file: File) => {
    const res = await uploadFile(file);
    console.log(res);
    handleDelete(file);
  }

  // if (!files.length) return null;

  return (
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
  );
}
