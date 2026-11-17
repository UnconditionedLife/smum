import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
    Box, Fab, Snackbar, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Chip, TableSortLabel, TextField, InputAdornment, IconButton, Button
} from '@mui/material';
import { Add, Search, Clear, Refresh } from '@mui/icons-material';
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

// Tinted, borderless status chip
const softChip = (color) => ({
    border: 0,
    bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
    color: (theme) => theme.palette[color].dark,
})

const headCells = [
    { id: 'FirstName', label: 'First Name' },
    { id: 'LastName', label: 'Last Name' },
    { id: 'Email', label: 'Email' },
    { id: 'Telephone', label: 'Telephone' },
    { id: 'ProgramName', label: 'Program' },
    { id: 'Time', label: 'Registered' },
    { id: 'Status', label: 'Status' },
];

function VolunteerList(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    function getProgramName(programId) {
        if (!programId || programId === '-' || programId === '0') return 'N/A';
        const program = props.programs.find(prog => prog.ProgramId === String(programId));
        return program ? program.ProgramName : 'N/A';
    }

    return (
        <Box sx={{ width: '100%', px: 2.5, pb: 2.5, pt: 1 }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
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
                                key={row.VolunteerId}
                                onClick={() => props.onEdit && props.onEdit(row.VolunteerId)}
                                sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                            >
                                <TableCell>{row.FirstName || ''}</TableCell>
                                <TableCell>{row.LastName || ''}</TableCell>
                                <TableCell>{row.Email || ''}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatPhone(row.Telephone || '')}</TableCell>
                                <TableCell>{getProgramName(row.ProgramId)}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {row.Time ? dayjs(row.Time).format('MMM D, YYYY h:mm A') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {row.RegComplete !== undefined && (
                                        row.RegComplete ? (
                                            <Chip label="Registered" size="small" color="success" variant="outlined" sx={ softChip('success') } />
                                        ) : (
                                            <Chip label="Not Registered" size="small" color="warning" variant="outlined" sx={ softChip('warning') } />
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
    const [orderBy, setOrderBy] = useState('LastName');
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
                p.ProgramId === v.ProgramId
            )?.ProgramName || 'N/A';

            return {
                ...v,
                FirstName: (v.FirstName || '').toLowerCase(),
                LastName: (v.LastName || '').toLowerCase(),
                Email: (v.Email || '').toLowerCase(),
                Telephone: (v.Telephone || '').replace(/\D/g, ''),
                ProgramName: programName.toLowerCase(),
                Time: v.Time ? new Date(v.Time).getTime() : 0,
                Status: v.RegComplete ? 1 : 0,
            };
        });

        // Filter based on search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            normalized = normalized.filter(v =>
                v.FirstName.includes(query) ||
                v.LastName.includes(query) ||
                v.Email.includes(query) ||
                v.Telephone.includes(query)
            );
        }

        return stableSort(normalized, getComparator(order, orderBy)).map(n => {
            // Map back to original object reference to preserve original casing/fields for display
            return volunteers.find(v => v.VolunteerId === n.VolunteerId);
        });
    }, [volunteers, programs, order, orderBy, searchQuery]);

    return (
        <Box
            sx={{}}>

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

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    px: 2.5,
                    pt: 2,
                    pb: 1,
                }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2
                    }}>
                    <Typography variant='subtitle1'>All Volunteers</Typography>
                    <Chip label={visibleVolunteers.length} size="small" sx={ softChip('primary') } />
                    <Tooltip title="Refresh List">
                        <IconButton size="small" onClick={getVolunteerList}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowDuplicatesDialog(true)}
                        sx={{ m: 0 }}
                    >
                        Find Duplicates
                    </Button>
                </Box>
                <TextField
                    size="small"
                    placeholder="Search volunteers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                        input: {
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
                        }
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