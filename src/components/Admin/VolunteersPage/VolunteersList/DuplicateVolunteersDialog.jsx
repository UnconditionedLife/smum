import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    List, ListItem, ListItemText, Radio, RadioGroup, FormControlLabel,
    Typography, Box, CircularProgress, Alert, Divider, IconButton, Tooltip, Chip
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { dbGetAllVolunteersAsync, dbMergeVolunteersAsync } from '../../../System/js/Database';
import { formatPhone } from '../../../System/js/Forms';
import dayjs from 'dayjs';

export default function DuplicateVolunteersDialog({ open, onClose, onMergeComplete }) {
    const [loading, setLoading] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [primaryId, setPrimaryId] = useState(null);
    const [merging, setMerging] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            findDuplicates();
        }
    }, [open]);

    const findDuplicates = async () => {
        setLoading(true);
        setError(null);
        try {
            const volunteers = await dbGetAllVolunteersAsync();
            const groups = {};

            volunteers.forEach(v => {
                // Normalize phone: remove non-digits, ignore leading +1 if present
                let phone = (v.Telephone || v.telephone || '').replace(/\D/g, '');
                if (phone.length === 11 && phone.startsWith('1')) phone = phone.substring(1);

                // Normalize email
                const email = (v.Email || v.email || '').toLowerCase().trim();

                if (phone && phone.length >= 10) {
                    const key = `phone:${phone}`;
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(v);
                }

                if (email) {
                    const key = `email:${email}`;
                    if (!groups[key]) groups[key] = [];
                    // Avoid adding same volunteer to same group twice (though key is different)
                    // But here we are grouping by key. A volunteer might appear in a phone group AND an email group.
                    // For simplicity, let's just collect all groups and then filter.
                    groups[key].push(v);
                }
            });

            // Filter groups with > 1 member and dedup volunteers within groups
            const duplicateGroups = Object.values(groups)
                .filter(group => group.length > 1)
                .map(group => {
                    // Unique volunteers in this group
                    const unique = [];
                    const map = new Map();
                    for (const item of group) {
                        const id = item.VolunteerId || item.volunteerId;
                        if (!map.has(id)) {
                            map.set(id, true);
                            unique.push(item);
                        }
                    }
                    return unique;
                })
                .filter(group => group.length > 1);

            // Deduplicate groups themselves?
            // If A and B match on phone, and A and B match on email, we get two identical groups.
            // Let's stringify IDs to detect identical groups.
            const uniqueGroupsMap = new Map();
            duplicateGroups.forEach(group => {
                const ids = group.map(v => v.VolunteerId || v.volunteerId).sort().join(',');
                if (!uniqueGroupsMap.has(ids)) {
                    uniqueGroupsMap.set(ids, group);
                }
            });

            const finalGroups = Array.from(uniqueGroupsMap.values());

            setDuplicates(finalGroups);
            if (finalGroups.length > 0) {
                setSelectedGroupIndex(0);
                // Default primary to the one with the most recent activity or registration?
                // For now, just the first one.
                setPrimaryId(finalGroups[0][0].VolunteerId || finalGroups[0][0].volunteerId);
            }

        } catch (err) {
            console.error("Error finding duplicates:", err);
            setError("Failed to load volunteers for duplicate check.");
        } finally {
            setLoading(false);
        }
    };

    const handleMerge = async () => {
        if (!primaryId) return;

        const currentGroup = duplicates[selectedGroupIndex];
        const duplicateVolunteers = currentGroup.filter(v => (v.VolunteerId || v.volunteerId) !== primaryId);

        if (duplicateVolunteers.length === 0) return;

        // Confirm
        if (!window.confirm(`Are you sure you want to merge ${duplicateVolunteers.length} record(s) into the selected primary volunteer? This will reassign shifts and DELETE the duplicate records.`)) {
            return;
        }

        setMerging(true);
        try {
            for (const dup of duplicateVolunteers) {
                const dupId = dup.VolunteerId || dup.volunteerId;
                await dbMergeVolunteersAsync(primaryId, dupId);
            }

            // Remove this group from the list
            const newDuplicates = [...duplicates];
            newDuplicates.splice(selectedGroupIndex, 1);
            setDuplicates(newDuplicates);

            if (newDuplicates.length > 0) {
                // Reset selection for next group
                if (selectedGroupIndex >= newDuplicates.length) {
                    setSelectedGroupIndex(newDuplicates.length - 1);
                }
                const nextGroup = newDuplicates[selectedGroupIndex >= newDuplicates.length ? newDuplicates.length - 1 : selectedGroupIndex];
                setPrimaryId(nextGroup[0].VolunteerId || nextGroup[0].volunteerId);
            } else {
                onMergeComplete(); // Refresh list
                onClose();
            }

        } catch (err) {
            console.error("Merge failed:", err);
            setError("Failed to merge volunteers. Check console for details.");
        } finally {
            setMerging(false);
        }
    };

    const currentGroup = duplicates[selectedGroupIndex];

    const getGroupName = (group) => {
        const names = group.map(v => {
            const first = v.FirstName || v.firstName || '';
            const last = v.LastName || v.lastName || '';
            return `${first} ${last}`.trim();
        }).filter(name => name.length > 0);

        const uniqueNames = [...new Set(names)];

        if (uniqueNames.length === 0) return `Group ${duplicates.indexOf(group) + 1}`;
        return uniqueNames.join(' / ');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Find Duplicate Volunteers</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : duplicates.length === 0 ? (
                    <Typography>No potential duplicates found based on phone number or email.</Typography>
                ) : (
                    <Box display="flex" height="400px">
                        {/* Left sidebar: List of duplicate groups */}
                        <Box width="30%" borderRight={1} borderColor="divider" pr={2} overflow="auto">
                            <Typography variant="subtitle2" gutterBottom>
                                Found {duplicates.length} sets of duplicates
                            </Typography>
                            <List dense>
                                {duplicates.map((group, index) => (
                                    <ListItem
                                        button
                                        key={index}
                                        selected={index === selectedGroupIndex}
                                        onClick={() => {
                                            setSelectedGroupIndex(index);
                                            setPrimaryId(group[0].VolunteerId || group[0].volunteerId);
                                        }}
                                    >
                                        <ListItemText
                                            primary={getGroupName(group)}
                                            secondary={`${group.length} records`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Right content: Details of selected group */}
                        <Box width="70%" pl={2} overflow="auto">
                            <Typography variant="h6" gutterBottom>
                                Select Primary Record
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                The selected record will be kept. All shifts from other records in this group will be reassigned to it, and the other records will be DELETED.
                            </Typography>

                            <RadioGroup
                                value={primaryId}
                                onChange={(e) => setPrimaryId(e.target.value)}
                            >
                                {currentGroup && currentGroup.map((vol) => {
                                    const vId = vol.VolunteerId || vol.volunteerId;
                                    return (
                                        <Box key={vId} mb={2} p={1} border={1} borderColor={primaryId === vId ? 'primary.main' : 'divider'} borderRadius={1}>
                                            <FormControlLabel
                                                value={vId}
                                                control={<Radio sx={{ mt: 0.5 }} />} // Adjust radio vertical alignment
                                                sx={{ width: '100%', alignItems: 'flex-start', ml: 0, mr: 0 }} // Ensure label takes full width and aligns to top
                                                label={
                                                    <Box width="100%" textAlign="left">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {vol.FirstName} {vol.LastName}
                                                            </Typography>
                                                            {vol.RegComplete !== undefined && (
                                                                vol.RegComplete ? (
                                                                    <Chip label="Registered" size="small" color="success" />
                                                                ) : (
                                                                    <Chip label="Not Registered" size="small" color="warning" />
                                                                )
                                                            )}
                                                        </Box>
                                                        <Typography variant="body2">
                                                            Email: {vol.Email}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Phone: {formatPhone(vol.Telephone)}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Registered: {vol.Time ? dayjs(vol.Time).format('MMM D, YYYY h:mm A') : 'N/A'}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center">
                                                            <Typography variant="caption" color="textSecondary">
                                                                ID: {vId}
                                                            </Typography>
                                                            <Tooltip title="Copy ID">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        navigator.clipboard.writeText(vId);
                                                                    }}
                                                                    sx={{ ml: 1, p: 0.5 }}
                                                                >
                                                                    <ContentCopy fontSize="inherit" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                    );
                                })}
                            </RadioGroup>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={merging}>
                    Close
                </Button>
                {duplicates.length > 0 && (
                    <Button
                        onClick={handleMerge}
                        color="primary"
                        variant="contained"
                        disabled={merging || loading}
                    >
                        {merging ? 'Merging...' : 'Merge Selected'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
