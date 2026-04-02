import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { Box, Typography, MenuItem, Divider, Switch, FormControlLabel } from '@mui/material';
import { FormTextField, FormSelect, SaveCancel } from '../../../System';
import { dbSaveVolunteerAsync, dbUpdateVolunteerAsync, dbGetAllProgramsAsync } from '../../../System/js/Database';
import { validPhone, formatPhone } from '../../../System/js/Forms';
import dayjs from 'dayjs';

VolunteerForm.propTypes = {
    volunteer: PropTypes.object,     // null to create new volunteer
    onClose: PropTypes.func.isRequired,
}

export default function VolunteerForm(props) {
    const isNewVolunteer = (props.volunteer == null);

    let volunteerData;
    if (isNewVolunteer) {
        volunteerData = {
            FirstName: '',
            LastName: '',
            Telephone: '',
            Email: '',
            ProgramId: '0'
        };
    } else {
        console.log('Loading volunteer for edit:', props.volunteer);
        console.log('Raw ProgramId from props:', props.volunteer.ProgramId);
        console.log('Raw Telephone from props:', props.volunteer.Telephone);

        // Decode phone if it's URL-encoded, then format for display
        let rawPhone = props.volunteer.Telephone || '';
        try {
            // Try to decode in case it's still URL-encoded
            rawPhone = decodeURIComponent(rawPhone);
            console.log('Decoded telephone:', rawPhone);
        } catch (e) {
            console.log('Telephone not URL-encoded or decode failed:', e);
        }

        const formattedPhone = rawPhone ? formatPhone(rawPhone) : '';
        console.log('Formatted telephone for display:', formattedPhone);

        volunteerData = {
            VolunteerId: props.volunteer.VolunteerId || '',
            FirstName: props.volunteer.FirstName || '',
            LastName: props.volunteer.LastName || '',
            Telephone: formattedPhone,
            Email: props.volunteer.Email || '',
            ProgramId: String(props.volunteer.ProgramId || '0'),
            isDeleted: props.volunteer.isDeleted || false
        };

        console.log('Processed volunteerData.ProgramId:', volunteerData.ProgramId);
    }

    const initValues = { ...volunteerData };

    const { control, handleSubmit, formState: { errors, dirtyFields }, reset } = useForm({
        defaultValues: initValues,
        mode: 'onChange'
    });

    const [saveMessage, setSaveMessage] = useState({});
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        // Load programs on mount
        dbGetAllProgramsAsync().then(progs => {
            console.log('Fetched programs for dropdown:', progs);
            progs?.forEach(p => {
                const id = p.ProgramId || p.programId || p.Id || p.id;
                console.log(`Program: ${p.ProgramName || p.Name || p.name}, ID: ${id}, Type: ${typeof id}`);
            });
            setPrograms(progs || []);
        }).catch(err => {
            console.error('Error loading programs:', err);
            setPrograms([]);
        });
    }, []);

    async function saveVolunteer(volunteerData, isNewVolunteer) {
        // Save to database
        if (isNewVolunteer) {
            return dbSaveVolunteerAsync(volunteerData);
        } else {
            // Use UPDATE endpoint for existing volunteers
            const volunteerId = JSON.parse(JSON.stringify(volunteerData.VolunteerId));
            // const volunteerId = volunteerData.VolunteerId;
            const updateData = { ...volunteerData };
            delete updateData.VolunteerId; // Don't send ID in the body
            return dbUpdateVolunteerAsync(volunteerId, updateData);
        }
    }

    async function onSubmit(formValues) {
        // Overwrite volunteer data structure with form values
        let submitData = { ...formValues };

        // Format phone: keep + and digits only (no dashes)
        // The + will be URL-encoded by the fetch API automatically
        const formattedPhone = formatPhone(formValues.Telephone);
        submitData.Telephone = formattedPhone.replace(/[^+\d]/g, ''); // Keep + and digits, e.g. "+16509657150"

        console.log('Submitting phone (before API):', submitData.Telephone);

        if (isNewVolunteer) {
            // Do not send VolunteerId for new volunteers
            delete submitData.VolunteerId;
        } else {
            // Added the Volunteer ID back into data
            if (!submitData.VolunteerId) submitData.VolunteerId = volunteerData.VolunteerId
        }

        try {
            const savedVolunteer = await saveVolunteer(submitData, isNewVolunteer);
            // Handle different API response formats
            const timestamp = savedVolunteer.updatedDateTime || new Date().toISOString();
            setSaveMessage({ result: 'success', time: timestamp });
            // Close dialog after successful save
            setTimeout(() => {
                props.onClose();
            }, 1000);
        } catch (error) {
            setSaveMessage({ result: 'error', message: error.message });
        }
    }

    // Format registration time if available
    const formatRegistrationTime = () => {
        if (!props.volunteer?.Time) return null;
        const time = dayjs(props.volunteer.Time);
        if (!time.isValid()) return null;
        return time.format('MMM D, YYYY [at] h:mm A');
    };

    const registrationTime = formatRegistrationTime();

    return (
        <Fragment>
            <form>
                {!isNewVolunteer && (
                    <Box sx={{ mb: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                ID: <strong>{volunteerData.VolunteerId}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">•</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {props.volunteer?.RegComplete ?
                                    `Registered: ${registrationTime || 'N/A'}` :
                                    'Not Registered'
                                }
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                    </Box>
                )}

                <Typography variant="subtitle1" sx={{ mb: 2 }}>Personal Information</Typography>
                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap" sx={{ mb: 3 }}>
                    <FormTextField
                        name="FirstName"
                        label="First Name"
                        fieldsize="md"
                        error={errors.FirstName}
                        control={control}
                        rules={{ required: 'Required' }}
                    />
                    <FormTextField
                        name="LastName"
                        label="Last Name"
                        fieldsize="md"
                        error={errors.LastName}
                        control={control}
                        rules={{ required: 'Required' }}
                    />
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>Contact Information</Typography>
                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap" sx={{ mb: 3 }}>
                    <FormTextField
                        name="Email"
                        label="Email"
                        fieldsize="lg"
                        error={errors.Email}
                        control={control}
                        rules={{
                            required: 'Required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        }}
                    />
                    <FormTextField
                        name="Telephone"
                        label="Telephone"
                        error={errors.Telephone}
                        control={control}
                        rules={{
                            required: 'Required',
                            validate: value => validPhone(value) || 'Enter a US phone number with area code'
                        }}
                    />
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>Program Assignment</Typography>
                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
                    <FormSelect
                        name="ProgramId"
                        label="Program"
                        fieldsize="lg"
                        error={errors.ProgramId}
                        control={control}
                        rules={{ required: 'Required' }}
                    >
                        <MenuItem value="0">No Program</MenuItem>
                        {programs.map((program) => {
                            const progId = program.ProgramId || program.programId || program.Id || program.id;
                            const progName = program.ProgramName || program.Name || program.name || 'Unknown';
                            return (
                                <MenuItem key={progId} value={String(progId)}>
                                    {progName}
                                </MenuItem>
                            );
                        })}
                    </FormSelect>
                </Box>

                {!isNewVolunteer && (
                    <>
                        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, color: 'error.main' }}>Danger Zone</Typography>
                        <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap" sx={{ mb: 3, p: .5, border: '1px solid', borderColor: 'error.main', borderRadius: 1 }}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="isDeleted"
                                        control={control}
                                        defaultValue={volunteerData?.isDeleted || false}
                                        render={(props) => {
                                            // Handle react-hook-form v6 vs v7 differences safely
                                            const val = props.field ? props.field.value : props.value;
                                            const onChange = props.field ? props.field.onChange : props.onChange;
                                            return (
                                                <Switch
                                                    checked={!!val}
                                                    onChange={(e) => onChange(e.target.checked)}
                                                    color="error"
                                                />
                                            );
                                        }}
                                    />
                                }
                                label="Mark as Deleted (Volunteer will no longer be active)"
                            />
                        </Box>
                    </>
                )}

                {saveMessage.result && (
                    <Box mt={3} mb={1}>
                        <Typography
                            color={saveMessage.result === 'success' ? 'success.main' : 'error.main'}
                            align="center"
                        >
                            {saveMessage.result === 'success'
                                ? `Saved successfully at ${new Date(saveMessage.time).toLocaleTimeString()}`
                                : saveMessage.message
                            }
                        </Typography>
                    </Box>
                )}
            </form>

            <SaveCancel
                onClick={(isSave) => {
                    isSave ? handleSubmit(onSubmit)() : props.onClose()
                }}
                saveDisabled={Object.keys(dirtyFields).length === 0}
                message={saveMessage}
            />
        </Fragment>
    );
} 