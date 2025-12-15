import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel, Select, MenuItem,
    Box, Grid, Typography, Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { dbUpdateShiftAsync } from '../../../System/js/Database';

export default function ShiftEditDialog({ open, shift, onClose, volunteers, programs, activities }) {
    const [editedShift, setEditedShift] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (shift) {
            setEditedShift({
                ...shift,
                // Timestamps are already in local time
                TimestampIn: shift.TimestampIn ? dayjs(shift.TimestampIn) : null,
                TimestampOut: shift.TimestampOut ? dayjs(shift.TimestampOut) : null,
                VolunteerId: shift.VolunteerId || '',
                ProgramId: shift.ProgramId || shift.programId || '',
                ActivityId: shift.ActivityId || shift.activityId || ''
            });
        }
    }, [shift, programs]);

    const handleChange = (field, value) => {
        setEditedShift(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!editedShift.VolunteerId) {
            alert('Please select a volunteer');
            return;
        }

        if (!editedShift.TimestampIn) {
            alert('Check-in time is required');
            return;
        }

        // If check-out time exists, it must be after check-in time
        if (editedShift.TimestampOut && editedShift.TimestampIn) {
            if (editedShift.TimestampOut.isBefore(editedShift.TimestampIn)) {
                alert('Check-out time must be after check-in time');
                return;
            }
        }

        setSaving(true);
        try {
            // Prepare data for API - only send fields that are being updated
            const dataToSave = {
                ShiftId: editedShift.ShiftId || editedShift.shiftId,
                VolunteerId: editedShift.VolunteerId,
                ProgramId: editedShift.ProgramId || null,
                ActivityId: editedShift.ActivityId || null,
                Date: editedShift.Date || (editedShift.TimestampIn ? editedShift.TimestampIn.format('YYYY-MM-DD') : null),
                TimestampIn: editedShift.TimestampIn,
                TimestampOut: editedShift.TimestampOut
            };

            console.log('Saving shift data:', dataToSave);
            const result = await dbUpdateShiftAsync(dataToSave);
            console.log('Shift save result:', result);
            onClose(true); // Pass true to indicate save was successful
        } catch (error) {
            console.error('Error saving shift:', error);
            alert(`Failed to save shift: ${error.message || 'Unknown error'}`);
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
                <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            ID: <strong>{shift.ShiftId || shift.shiftId || 'Unknown'}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Date: {shift.Date || dayjs(shift.TimestampIn).format('YYYY-MM-DD') || 'Unknown'}
                        </Typography>
                        {(() => {
                            const timestampIn = shift.TimestampIn ? dayjs(shift.TimestampIn) : null;
                            const timestampOut = shift.TimestampOut ? dayjs(shift.TimestampOut) : null;
                            let duration = '-';

                            if (timestampIn && timestampOut) {
                                const durationMinutes = timestampOut.diff(timestampIn, 'minute');
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                if (hours > 0) {
                                    duration = `${hours}h ${minutes}m`;
                                } else {
                                    duration = `${minutes}m`;
                                }
                            } else if (timestampIn && !timestampOut) {
                                const now = dayjs();
                                const durationMinutes = now.diff(timestampIn, 'minute');
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                if (hours > 0) {
                                    duration = `${hours}h ${minutes}m (ongoing)`;
                                } else {
                                    duration = `${minutes}m (ongoing)`;
                                }
                            }

                            return duration !== '-' ? (
                                <>
                                    <Typography variant="body2" color="text.secondary">•</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Duration: {duration}
                                    </Typography>
                                </>
                            ) : null;
                        })()}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                </Box>
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