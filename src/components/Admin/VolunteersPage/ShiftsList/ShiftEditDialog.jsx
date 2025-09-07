import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel, Select, MenuItem,
    Box, Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { dbUpdateShiftAsync } from '../../../System/js/Database';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ShiftEditDialog({ open, shift, onClose, volunteers, programs, activities }) {
    const [editedShift, setEditedShift] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (shift) {
            setEditedShift({
                ...shift,
                // Convert UTC timestamps to local dayjs objects for editing
                TimestampIn: shift.TimestampIn ? dayjs.utc(shift.TimestampIn).local() : null,
                TimestampOut: shift.TimestampOut ? dayjs.utc(shift.TimestampOut).local() : null,
                VolunteerId: shift.VolunteerId || '',
                ProgramId: shift.ProgramId || shift.programId || '',
                ActivityId: shift.ActivityId || shift.activityId || ''
            });
        }
    }, [shift]);

    const handleChange = (field, value) => {
        setEditedShift(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare data for API - convert local times back to UTC
            const dataToSave = {
                ...editedShift,
                TimestampIn: editedShift.TimestampIn ? editedShift.TimestampIn.utc().toISOString() : null,
                TimestampOut: editedShift.TimestampOut ? editedShift.TimestampOut.utc().toISOString() : null
            };

            await dbUpdateShiftAsync(dataToSave);
            onClose(true); // Pass true to indicate save was successful
        } catch (error) {
            console.error('Error saving shift:', error);
            alert('Failed to save shift. Please try again.');
        } finally {
            setSaving(false);
        }
    };
    
    const handleCancel = () => {
        onClose(false); // Pass false to indicate cancel
    };

    if (!shift) return null;

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Volunteer</InputLabel>
                                <Select
                                    value={editedShift.VolunteerId || ''}
                                    onChange={(e) => handleChange('VolunteerId', e.target.value)}
                                    label="Volunteer"
                                >
                                    {volunteers.map(vol => (
                                        <MenuItem key={vol.VolunteerId} value={vol.VolunteerId}>
                                            {`${vol.FirstName || vol.firstName || ''} ${vol.LastName || vol.lastName || ''}`.trim()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Check In Time"
                                    value={editedShift.TimestampIn}
                                    onChange={(value) => handleChange('TimestampIn', value)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    ampm={true}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Check Out Time"
                                    value={editedShift.TimestampOut}
                                    onChange={(value) => handleChange('TimestampOut', value)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    ampm={true}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Program</InputLabel>
                                <Select
                                    value={editedShift.ProgramId || ''}
                                    onChange={(e) => handleChange('ProgramId', e.target.value)}
                                    label="Program"
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {programs.map(prog => {
                                        const progId = prog.ProgramId || prog.programId || prog.Id || prog.id || prog.ID;
                                        const progName = prog.ProgramName || prog.Name || prog.name || `Program ${progId}`;
                                        return (
                                            <MenuItem key={progId} value={progId}>
                                                {progName}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Activity</InputLabel>
                                <Select
                                    value={editedShift.ActivityId || ''}
                                    onChange={(e) => handleChange('ActivityId', e.target.value)}
                                    label="Activity"
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {activities.map(act => {
                                        const actId = act.ActivityId || act.activityId || act.Id || act.id || act.ID;
                                        const actName = act.ActivityName_en || act.ActivityName || act.Name || act.name || `Activity ${actId}`;
                                        return (
                                            <MenuItem key={actId} value={actId}>
                                                {actName}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}