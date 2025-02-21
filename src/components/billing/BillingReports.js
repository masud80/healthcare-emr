import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  calculateBillAging, 
  formatCurrency,
  filterBills 
} from '../../utils/billingUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const BillingReports = () => {
  const { bills } = useSelector(state => state.billing);
  const [timeframe, setTimeframe] = useState('month');
  const [reportType, setReportType] = useState('revenue');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    generateReport();
  }, [bills, timeframe, reportType]);

  const generateReport = () => {
    switch (reportType) {
      case 'revenue':
        generateRevenueReport();
        break;
      case 'payment-methods':
        generatePaymentMethodsReport();
        break;
      case 'aging':
        generateAgingReport();
        break;
      case 'status':
        generateStatusReport();
        break;
      default:
        setReportData(null);
    }
  };

  const generateRevenueReport = () => {
    const data = [];
    const now = new Date();
    const periods = timeframe === 'month' ? 12 : 6;

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthBills = bills.filter(bill => {
        const billDate = new Date(bill.createdAt);
        return billDate.getMonth() === date.getMonth() &&
               billDate.getFullYear() === date.getFullYear();
      });

      data.push({
        name: date.toLocaleString('default', { month: 'short' }),
        billed: monthBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
        collected: monthBills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0)
      });
    }

    setReportData(data);
  };

  const generatePaymentMethodsReport = () => {
    const methodTotals = bills.reduce((acc, bill) => {
      bill.payments?.forEach(payment => {
        acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      });
      return acc;
    }, {});

    const data = Object.entries(methodTotals).map(([method, amount]) => ({
      name: method.replace('_', ' ').toUpperCase(),
      value: amount
    }));

    setReportData(data);
  };

  const generateAgingReport = () => {
    const aging = calculateBillAging(bills);
    const data = Object.entries(aging).map(([range, amount]) => ({
      name: range,
      value: amount
    }));

    setReportData(data);
  };

  const generateStatusReport = () => {
    const statusCounts = bills.reduce((acc, bill) => {
      acc[bill.status] = (acc[bill.status] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.toUpperCase(),
      value: count
    }));

    setReportData(data);
  };

  const renderChart = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'revenue':
        return (
          <BarChart width={800} height={400} data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="billed" fill="#8884d8" name="Billed" />
            <Bar dataKey="collected" fill="#82ca9d" name="Collected" />
          </BarChart>
        );

      case 'payment-methods':
      case 'aging':
      case 'status':
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={reportData}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${
                reportType === 'status' ? value : formatCurrency(value)
              }`}
            >
              {reportData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => 
              reportType === 'status' ? value : formatCurrency(value)
            } />
          </PieChart>
        );

      default:
        return null;
    }
  };

  const calculateSummaryStats = () => {
    const totalBilled = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalCollected = bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    const totalPending = totalBilled - totalCollected;
    const collectionRate = (totalCollected / totalBilled) * 100;

    return {
      totalBilled,
      totalCollected,
      totalPending,
      collectionRate
    };
  };

  const stats = calculateSummaryStats();

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Billing Reports & Analytics
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Billed
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(stats.totalBilled)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Collected
                </Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(stats.totalCollected)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Pending
                </Typography>
                <Typography variant="h5" color="error.main">
                  {formatCurrency(stats.totalPending)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Collection Rate
                </Typography>
                <Typography variant="h5">
                  {stats.collectionRate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={4}>
          <Grid item>
            <FormControl>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ minWidth: 200 }}
              >
                <MenuItem value="revenue">Revenue Analysis</MenuItem>
                <MenuItem value="payment-methods">Payment Methods</MenuItem>
                <MenuItem value="aging">Aging Analysis</MenuItem>
                <MenuItem value="status">Bill Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {reportType === 'revenue' && (
            <Grid item>
              <FormControl>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  style={{ minWidth: 150 }}
                >
                  <MenuItem value="month">Last 12 Months</MenuItem>
                  <MenuItem value="quarter">Last 6 Quarters</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item>
            <Button
              variant="contained"
              onClick={generateReport}
              style={{ marginTop: 8 }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="center">
            {renderChart()}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default BillingReports;
