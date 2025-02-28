import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Papa from 'papaparse';

const BillingCodes = () => {
  const [codes, setCodes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchBillingCodes();
  }, []);

  const fetchBillingCodes = async () => {
    try {
      const billingCodesRef = collection(db, 'billing_codes');
      const querySnapshot = await getDocs(query(billingCodesRef));
      const codesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCodes(codesData);
    } catch (error) {
      console.error('Error fetching billing codes:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const batch = [];
            const totalRows = results.data.length;
            
            for (let i = 0; i < results.data.length; i++) {
              const row = results.data[i];
              if (row.procedureCode) { // Only process rows with a procedure code
                batch.push({
                  procedureCode: row.procedureCode,
                  procedureType: row.procedureType,
                  description: row.description,
                  icd10Code: row.icd10Code,
                  cptCode: row.cptCode,
                  rate: parseFloat(row.rate) || 0,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });
              }
              setUploadProgress(Math.round((i + 1) / totalRows * 100));
            }

            // Add all records to Firestore
            const billingCodesRef = collection(db, 'billing_codes');
            for (const item of batch) {
              await addDoc(billingCodesRef, item);
            }

            await fetchBillingCodes(); // Refresh the list
            setUploadDialogOpen(false);
            setUploadProgress(0);
          } catch (error) {
            console.error('Error uploading billing codes:', error);
            alert('Error uploading billing codes. Please try again.');
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the file format.');
        }
      });
    }
  };

  const filteredCodes = codes.filter(code => 
    code.procedureCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.icd10Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.cptCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Billing Codes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Add New Code
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search billing codes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Procedure Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>ICD-10 Code</TableCell>
              <TableCell>CPT Code</TableCell>
              <TableCell>Rate ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCodes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((code) => (
                <TableRow key={code.id}>
                  <TableCell>{code.procedureCode}</TableCell>
                  <TableCell>{code.procedureType}</TableCell>
                  <TableCell>{code.description}</TableCell>
                  <TableCell>{code.icd10Code}</TableCell>
                  <TableCell>{code.cptCode}</TableCell>
                  <TableCell>${code.rate?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            {filteredCodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No billing codes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCodes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Billing Codes</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" gutterBottom>
              Upload a CSV file with the following columns:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>procedureCode</li>
              <li>procedureType</li>
              <li>description</li>
              <li>icd10Code</li>
              <li>cptCode</li>
              <li>rate</li>
            </Typography>
            {uploadProgress > 0 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Upload progress: {uploadProgress}%
              </Typography>
            )}
            <Button
              variant="contained"
              component="label"
              sx={{ mt: 2 }}
            >
              Choose File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingCodes; 