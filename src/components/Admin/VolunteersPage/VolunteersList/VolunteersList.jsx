import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Accordion, AccordionDetails, AccordionSummary, Box, Fab, Snackbar, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Chip, TableSortLabel, TextField, InputAdornment, IconButton, Button
} from '@mui/material';
import { Add, ExpandMore, Search, Clear, Refresh } from '@mui/icons-material';
import VolunteerPage from '../VolunteerPage/VolunteerPage.jsx';
import DuplicateVolunteersDialog from './DuplicateVolunteersDialog.jsx';
import { navigationAllowed, dbGetAllVolunteersAsync, dbGetAllProgramsAsync } from '../../../System/js/Database';
import { formatPhone } from '../../../System/js/Forms';
import dayjs from 'dayjs';

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'telephone', label: 'Telephone' },
    { id: 'programName', label: 'Program' },
    { id: 'time', label: 'Registered' },
    { id: 'status', label: 'Status' },
];

function VolunteerList(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    function getProgramName(programId) {
        if (!programId || programId === '-') return 'N/A';
        const program = props.programs.find(prog => {
            // Check various possible ID field names
            const progId = prog.ProgramId || prog.programId || prog.Id || prog.id || prog.ID;
            return progId === programId || progId == programId;
        });
        if (program) {
            return program.ProgramName || program.Name || program.name || 'N/A';
        }
        return 'N/A';
    }

    return (
        <Box width='100%' mx={2}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align="center"
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell.id}
                                        direction={orderBy === headCell.id ? order : 'asc'}
                                        onClick={createSortHandler(headCell.id)}
                                    >
                                        {headCell.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.list.map((row) => (
                            <TableRow
                                key={row.VolunteerId || row.volunteerId}
                                onClick={() => props.onEdit && props.onEdit(row.VolunteerId || row.volunteerId)}
                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell align="center">{row.FirstName || row.firstName || ''}</TableCell>
                                <TableCell align="center">{row.LastName || row.lastName || ''}</TableCell>
                                <TableCell align="center">{row.Email || row.email || ''}</TableCell>
                                <TableCell align="center">{formatPhone(row.Telephone || row.telephone || '')}</TableCell>
                                <TableCell align="center">{getProgramName(row.ProgramId || row.programId)}</TableCell>
                                <TableCell align="center">
                                    {row.Time ? dayjs(row.Time).format('MMM D, YYYY h:mm A') : 'N/A'}
                                </TableCell>
                                <TableCell align="center">
                                    {row.RegComplete !== undefined && (
                                        row.RegComplete ? (
                                            <Chip label="Registered" size="small" color="success" />
                                        ) : (
                                            <Chip label="Not Registered" size="small" color="warning" />
                                        )
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

VolunteerList.propTypes = {
    list: PropTypes.array.isRequired,
    programs: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
}

export default function VolunteersList() {
    const [newVolunteer, setNewVolunteer] = useState(false);
    const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
    const [editVolunteerId, setEditVolunteerId] = useState(null);
    const [volunteers, setVolunteers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('lastName');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getVolunteerList() //initial load
        getProgramsList() //load programs for decoding
    }, [newVolunteer])

    function getVolunteerList() {
        dbGetAllVolunteersAsync().then(volunteers => {
            console.log('Fetched volunteers:', volunteers);
            setVolunteers(
                (volunteers || [])
                    .filter(v => v && typeof v === 'object')
            );
        });
    }

    function getProgramsList() {
        dbGetAllProgramsAsync().then(progs => {
            console.log('Fetched programs:', progs);
            setPrograms(progs || []);
        }).catch(err => {
            console.error('Error loading programs:', err);
            setPrograms([]);
        });
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const visibleVolunteers = useMemo(() => {
        // Normalize data for sorting
        let normalized = volunteers.map(v => {
            const programName = programs.find(p =>
                (p.ProgramId || p.programId || p.Id || p.id || p.ID) === (v.ProgramId || v.programId)
            )?.ProgramName || 'N/A';

            return {
                ...v,
                firstName: (v.FirstName || v.firstName || '').toLowerCase(),
                lastName: (v.LastName || v.lastName || '').toLowerCase(),
                email: (v.Email || v.email || '').toLowerCase(),
                telephone: (v.Telephone || v.telephone || '').replace(/\D/g, ''),
                programName: programName.toLowerCase(),
                time: v.Time ? new Date(v.Time).getTime() : 0,
                status: v.RegComplete ? 1 : 0,
            };
        });

        // Filter based on search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            normalized = normalized.filter(v =>
                v.firstName.includes(query) ||
                v.lastName.includes(query) ||
                v.email.includes(query) ||
                v.telephone.includes(query)
            );
        }

        return stableSort(normalized, getComparator(order, orderBy)).map(n => {
            // Map back to original object reference to preserve original casing/fields for display
            return volunteers.find(v => (v.VolunteerId || v.volunteerId) === (n.VolunteerId || n.volunteerId));
        });
    }, [volunteers, programs, order, orderBy, searchQuery]);

    return (
        <Box mt={2} mb={2}>

            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={true}>
                <Tooltip title='Add Volunteer'>
                    <Fab onClick={() => {
                        if (navigationAllowed()) {
                            setNewVolunteer(true)
                        }
                    }} size="small" color='default' >
                        <Add />
                    </Fab>
                </Tooltip>
            </Snackbar>

            {newVolunteer &&
                <VolunteerPage clearRecord={() => { setNewVolunteer(false); getVolunteerList(); }} volunteerId={null} />
            }

            {editVolunteerId &&
                <VolunteerPage clearRecord={() => { setEditVolunteerId(null); getVolunteerList(); }} volunteerId={editVolunteerId} />
            }

            <DuplicateVolunteersDialog
                open={showDuplicatesDialog}
                onClose={() => setShowDuplicatesDialog(false)}
                onMergeComplete={() => {
                    getVolunteerList();
                    // Keep dialog open to find more duplicates? Or close it?
                    // Let's keep it open if there are more groups, but the dialog handles that internally by removing the group.
                    // If we want to refresh the list BEHIND the dialog, we do getVolunteerList.
                }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mx={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant='h6'>Volunteers</Typography>
                    <Chip label={visibleVolunteers.length} color="secondary" size="small" />
                    <Tooltip title="Refresh List">
                        <IconButton size="small" onClick={getVolunteerList} color="success">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowDuplicatesDialog(true)}
                    >
                        Find Duplicates
                    </Button>
                </Box>
                <TextField
                    size="small"
                    placeholder="Search volunteers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>
            <VolunteerList
                list={visibleVolunteers}
                programs={programs}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                onEdit={(volunteerId) => {
                    if (navigationAllowed()) {
                        setEditVolunteerId(volunteerId);
                    }
                }}
            />
        </Box>
    );
} 