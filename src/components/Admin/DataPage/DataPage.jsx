import React, { useState } from 'react';
import { 
    Box, Button, Card, CardContent, CardHeader, Container, 
    Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, CircularProgress, Alert,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    Grid, Divider
} from '@mui/material';
import { Download, Storage, Shield, People, Home, ArrowBack, Assignment, VolunteerActivism } from '@mui/icons-material';
import { dbGetAllClientsAsync } from '../../System/js/Database';
import { utilCalcAge, calcDependentsAges, calcFamilyCounts } from '../../System/js/Clients/ClientUtils';
import { downloadFile } from '../../System/js/GlobalUtils';
import dayjs from 'dayjs';

export default function DataPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exportType, setExportType] = useState('households');
    const [downloading, setDownloading] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'clients'

    function loadClientData() {
        setLoading(true);
        setActiveSection('clients');
        setError(null);
        
        dbGetAllClientsAsync()
            .then(data => {
                if (data) {
                    const prepared = data.map(c => {
                        // Ensure dependents is at least an empty array
                        c.dependents = c.dependents || [];
                        
                        // Calculate ages and family metrics
                        let newC = utilCalcAge(c);
                        newC.dependents = calcDependentsAges(newC);
                        newC.family = calcFamilyCounts(newC);
                        return newC;
                    });
                    setClients(prepared);
                } else {
                    setClients([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load clients for export: ", err);
                setError("Failed to load client data from the database. Please refresh and try again.");
                setLoading(false);
            });
    }

    function handleBackToDashboard() {
        setActiveSection('dashboard');
        // Keep clients cache in memory so returning doesn't require reloading
    }

    // 1. Households CSV Mapper
    function getHouseholdRows(clientsList) {
        let id = 1;

        return clientsList.map(c => {
            return {
                clientId: id++,
                isActive: c.isActive || '',
                firstSeenDate: c.firstSeenDate || '',
                familyIdCheckedDate: c.familyIdCheckedDate || '',
                gender: c.gender || '',
                ethnicGroup: c.ethnicGroup || '',
                age: c.age || '',
                homeless: c.homeless || '',
                city: c.city || '',
                state: c.state || '',
                zipcode: c.zipcode || '',
                totalSize: c.family?.totalSize ?? '',
                totalAdults: c.family?.totalAdults ?? '',
                totalChildren: c.family?.totalChildren ?? '',
                totalSeniors: c.family?.totalSeniors ?? '',
                totalOtherDependents: c.family?.totalOtherDependents ?? ''
            };
        });
    }

    // 2. Individuals CSV Mapper
    function getIndividualRows(clientsList) {
        const rows = [];
        let id = 1;

        clientsList.forEach(c => {
            const householdId = id++;

            // Add primary head of household
            rows.push({
                householdId: householdId,
                personType: 'Client (Head)',
                status: c.isActive || '',
                relationship: 'Self',
                gender: c.gender || '',
                age: c.age || '',
                grade: 'None',
                homeless: c.homeless || '',
                city: c.city || '',
                state: c.state || '',
                zipcode: c.zipcode || ''
            });

            // Add active dependents
            c.dependents.forEach(d => {
                rows.push({
                    householdId: householdId,
                    personType: 'Dependent',
                    status: d.isActive || 'Active',
                    relationship: d.relationship || '',
                    gender: d.gender || '',
                    age: d.age || '',
                    grade: d.grade || 'None',
                    homeless: c.homeless || '',
                    city: c.city || '',
                    state: c.state || '',
                    zipcode: c.zipcode || ''
                });
            });
        });
        return rows;
    }

    // CSV generator helper
    function convertToCSV(headers, data, keys) {
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = keys.map(key => {
                const val = row[key];
                if (val === null || val === undefined) return '';
                const stringVal = String(val);
                
                // Escape commas, quotes and newlines
                if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
                    return `"${stringVal.replace(/"/g, '""')}"`;
                }
                return stringVal;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    // Trigger file download
    function handleDownload() {
        let headers, keys, data, fileName;

        if (exportType === 'households') {
            headers = [
                "Household ID", "Status", "First Seen Date", "ID Checked Date", 
                "Gender", "Ethnicity", "Age", "Homeless", 
                "City", "State", "Zipcode", "Total Family Size", 
                "Total Adults", "Total Children", "Total Seniors", "Total Other Dependents"
            ];
            keys = [
                "clientId", "isActive", "firstSeenDate", "familyIdCheckedDate",
                "gender", "ethnicGroup", "age", "homeless",
                "city", "state", "zipcode", "totalSize",
                "totalAdults", "totalChildren", "totalSeniors", "totalOtherDependents"
            ];
            data = getHouseholdRows(clients);
            fileName = `anonymized_households_${dayjs().format('YYYY-MM-DD')}.csv`;
        } else {
            headers = [
                "Household ID", "Person Type", "Status", "Relationship", 
                "Gender", "Age", "Grade", "Homeless", 
                "City", "State", "Zipcode"
            ];
            keys = [
                "householdId", "personType", "status", "relationship",
                "gender", "age", "grade", "homeless",
                "city", "state", "zipcode"
            ];
            data = getIndividualRows(clients);
            fileName = `anonymized_individuals_${dayjs().format('YYYY-MM-DD')}.csv`;
        }

        try {
            setDownloading(true);

            const csvContent = convertToCSV(headers, data, keys);
            downloadFile(csvContent, 'text/csv;charset=utf-8;', fileName)
        } catch (err) {
            console.error("Export failed: ", err);
            alert("An error occurred during file generation. Please try again.");
        } finally {
            setDownloading(false);
        }
    }

    // Calculate total count of individuals (clients + all dependents)
    const totalIndividualsCount = clients.reduce((acc, curr) => acc + 1 + curr.dependents.length, 0);

    // Get preview dataset
    const previewData = exportType === 'households' 
        ? getHouseholdRows(clients).slice(0, 5) 
        : getIndividualRows(clients).slice(0, 5);

    const householdPreviewHeaders = [
        { label: "Household ID", key: "clientId" },
        { label: "Status", key: "isActive" },
        { label: "Gender", key: "gender" },
        { label: "Ethnicity", key: "ethnicGroup" },
        { label: "Age", key: "age" },
        { label: "Homeless", key: "homeless" },
        { label: "Zipcode", key: "zipcode" },
        { label: "Family Size", key: "totalSize" }
    ];

    const individualPreviewHeaders = [
        { label: "Household ID", key: "householdId" },
        { label: "Person Type", key: "personType" },
        { label: "Relationship", key: "relationship" },
        { label: "Gender", key: "gender" },
        { label: "Age", key: "age" },
        { label: "Grade", key: "grade" },
        { label: "Zipcode", key: "zipcode" }
    ];

    const currentHeaders = exportType === 'households' ? householdPreviewHeaders : individualPreviewHeaders;

    // RENDER: Modules Dashboard List
    if (activeSection === 'dashboard') {
        return (
            <Container maxWidth="lg" style={{ paddingBottom: '32px' }}>
                <Box mb={3} display="flex" alignItems="center" gap={1.5}>
                    <Storage color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" fontWeight="bold">Data Administration</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Anonymization Note */}
                    <Grid item xs={12}>
                        <Card style={{ 
                            borderLeft: '5px solid #2e7d32', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            background: 'linear-gradient(to right, #f4fbf4, #ffffff)' 
                        }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Shield color="primary" />
                                    <Typography variant="h6" fontWeight="bold">Secure Data Management Portal</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Export database records in clean CSV formats. PII is automatically stripped or sanitized on the client side before downloading. Select a data module below to begin.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Data Modules Grid */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                            <CardContent style={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                    <People color="primary" fontSize="large" />
                                    <Typography variant="h6" fontWeight="bold">Client Records</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                                    Load, view and export anonymized client household details and individual listings. All direct identifiers are removed to guarantee client privacy.
                                </Typography>
                            </CardContent>
                            <Box p={2} pt={0}>
                                <Button 
                                    onClick={loadClientData} 
                                    variant="contained" 
                                    color="primary"
                                    fullWidth
                                    style={{ fontWeight: 'bold', background: 'linear-gradient(to right, #4caf50, #2e7d32)' }}
                                >
                                    Load Anonymized Client Data
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Service Logs Placeholder */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', opacity: 0.75 }}>
                            <CardContent style={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                    <Assignment color="disabled" fontSize="large" />
                                    <Typography variant="h6" fontWeight="bold" color="text.secondary">Service Transaction Logs</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                                    Export logs of services distributed (Food Pantry, Turkeys, Gift Cards, Toys) over specific periods. Includes statistics on distributions.
                                </Typography>
                            </CardContent>
                            <Box p={2} pt={0}>
                                <Button 
                                    disabled 
                                    variant="outlined" 
                                    fullWidth
                                    style={{ fontWeight: 'bold' }}
                                >
                                    Coming Soon
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Volunteer Logs Placeholder */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', opacity: 0.75 }}>
                            <CardContent style={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                    <VolunteerActivism color="disabled" fontSize="large" />
                                    <Typography variant="h6" fontWeight="bold" color="text.secondary">Volunteer Logs</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                                    Export volunteer logs, shift records, registrations and total hours. Allows analysis of volunteer attendance and program resource inputs.
                                </Typography>
                            </CardContent>
                            <Box p={2} pt={0}>
                                <Button 
                                    disabled 
                                    variant="outlined" 
                                    fullWidth
                                    style={{ fontWeight: 'bold' }}
                                >
                                    Coming Soon
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    // RENDER: Loading Clients
    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box mb={3}>
                    <Button startIcon={<ArrowBack />} onClick={handleBackToDashboard} variant="text" color="primary">
                        Cancel and Go Back
                    </Button>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="250px" flexDirection="column" gap={2}>
                    <CircularProgress color="primary" size={50} />
                    <Typography variant="body1" fontWeight="bold">Loading and preparing client records from the database...</Typography>
                    <Typography variant="caption" color="text.secondary">This may take a moment depending on dataset size.</Typography>
                </Box>
            </Container>
        );
    }

    // RENDER: Client Data Section (Loaded / Config / Export)
    return (
        <Container maxWidth="lg" style={{ paddingBottom: '32px' }}>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Button startIcon={<ArrowBack />} onClick={handleBackToDashboard} variant="outlined" color="primary" style={{ fontWeight: 'bold' }}>
                    Back to Data Modules
                </Button>
                <Box display="flex" alignItems="center" gap={1}>
                    <People color="primary" />
                    <Typography variant="h6" fontWeight="bold">Anonymized Client Data Export</Typography>
                </Box>
            </Box>

            {error && (
                <Box mb={3}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            <Grid container spacing={3}>
                {/* 1. Anonymization Protocol Note */}
                <Grid item xs={12}>
                    <Card style={{ 
                        borderLeft: '5px solid #2e7d32', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        background: 'linear-gradient(to right, #f4fbf4, #ffffff)' 
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Shield color="primary" />
                                <Typography variant="h6" fontWeight="bold">Client Anonymization Protocol</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" style={{ lineHeight: 1.6 }}>
                                In compliance with data security and client privacy practices, all exports are fully anonymized.
                                Personally Identifiable Information (PII) including <strong>Names (First/Last), Street Addresses, Phone Numbers, and Email Addresses</strong> are completely excluded.
                                Street addresses are limited to city, state, and 5-digit zip code.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 2. Export Configuration and Statistics */}
                <Grid item xs={12} md={4}>
                    <Card style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardHeader 
                            title="Export Settings" 
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                        />
                        <Divider />
                        <CardContent>
                            {/* Summary Stats */}
                            <Box mb={3} display="flex" flexDirection="column" gap={1.5}>
                                <Box display="flex" alignItems="center" gap={1.5} p={1.5} style={{ backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                    <Home color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Households (Clients)</Typography>
                                        <Typography variant="h6" fontWeight="bold">{clients.length}</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1.5} p={1.5} style={{ backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                    <People color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Total Individuals Served</Typography>
                                        <Typography variant="h6" fontWeight="bold">{totalIndividualsCount}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <FormControl component="fieldset" fullWidth>
                                <FormLabel component="legend" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Select Export Type</FormLabel>
                                <RadioGroup
                                    aria-label="export-type"
                                    name="export-type"
                                    value={exportType}
                                    onChange={(e) => setExportType(e.target.value)}
                                >
                                    <FormControlLabel 
                                        value="households" 
                                        control={<Radio color="primary" />} 
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">Household Summaries</Typography>
                                                <Typography variant="caption" color="text.secondary">One row per client household including family demographic counts.</Typography>
                                            </Box>
                                        }
                                        style={{ marginBottom: '12px' }}
                                    />
                                    <FormControlLabel 
                                        value="individuals" 
                                        control={<Radio color="primary" />} 
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">Individuals List</Typography>
                                                <Typography variant="caption" color="text.secondary">One row per household member (primary client + dependents).</Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>

                            <Box mt={4} display="flex" justifyContent="center">
                                <Button 
                                    onClick={handleDownload} 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                                    disabled={downloading || clients.length === 0}
                                    fullWidth
                                    style={{ 
                                        height: '46px', 
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(to right, #4caf50, #2e7d32)'
                                    }}
                                >
                                    {downloading ? "Generating..." : "Download CSV"}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 3. Live Data Preview Card */}
                <Grid item xs={12} md={8}>
                    <Card style={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardHeader 
                            title="Anonymized Data Preview" 
                            subheader="Showing the first 5 records of the selected export structure"
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                            subheaderTypographyProps={{ variant: 'caption' }}
                        />
                        <Divider />
                        <CardContent style={{ padding: 0 }}>
                            {clients.length === 0 ? (
                                <Box p={4} textAlign="center">
                                    <Typography color="text.secondary">No client data available.</Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} style={{ elevation: 0, boxShadow: 'none', border: 'none' }}>
                                    <Table size="small" aria-label="preview table">
                                        <TableHead style={{ backgroundColor: '#f9f9f9' }}>
                                            <TableRow>
                                                {currentHeaders.map((header) => (
                                                    <TableCell key={header.key} style={{ fontWeight: 'bold', borderBottom: '2px solid #e0e0e0' }}>
                                                        {header.label}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {previewData.map((row, idx) => (
                                                <TableRow key={idx} hover style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#ffffff' }}>
                                                    {currentHeaders.map((header) => (
                                                        <TableCell key={header.key} style={{ color: '#555' }}>
                                                            {row[header.key] !== '' ? row[header.key] : <Typography variant="caption" style={{ color: '#bbb', fontStyle: 'italic' }}>null</Typography>}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
