import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Box, Grid, Button, Typography, MenuItem, Divider } from '@mui/material';
import { FormTextField, FormSelect, SaveCancel } from '../../../System';
import { dbSaveVolunteerAsync, dbUpdateVolunteerAsync } from '../../../System/js/Database';

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
            Email: ''
        };
    } else {
        volunteerData = {
            VolunteerId: props.volunteer.VolunteerId || '',
            FirstName: props.volunteer.FirstName || '',
            LastName: props.volunteer.LastName || '',
            Telephone: props.volunteer.Telephone || '',
            Email: props.volunteer.Email || ''
        };
    }

    const initValues = { ...volunteerData };

    const { control, handleSubmit, formState: { errors, dirtyFields }, reset } = useForm({
        defaultValues: initValues,
        mode: 'onChange'
    });

    const [saveMessage, setSaveMessage] = useState({});

    async function saveVolunteer(volunteerData, isNewVolunteer) {
        // Save to database
        if (isNewVolunteer) {
            return dbSaveVolunteerAsync(volunteerData);
        } else {
            // Use UPDATE endpoint for existing volunteers
            const volunteerId = volunteerData.VolunteerId;
            const updateData = { ...volunteerData };
            delete updateData.VolunteerId; // Don't send ID in the body
            return dbUpdateVolunteerAsync(volunteerId, updateData);
        }
    }

    async function onSubmit(formValues) {
        // Overwrite volunteer data structure with form values
        let submitData = { ...formValues };
        if (isNewVolunteer) {
            // Do not send VolunteerId for new volunteers
            delete submitData.VolunteerId;
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

    return (
        <Fragment>
            <form>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Volunteer Info</Typography>

                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
                    {!isNewVolunteer && (
                        <FormTextField
                            name="VolunteerId"
                            label="Volunteer ID"
                            disabled={true}
                            error={errors.VolunteerId}
                            control={control}
                        />
                    )}
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

                <Typography variant="subtitle1" sx={{ mb: 1 }}>Contact Info</Typography>
                <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
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
                        rules={{ required: 'Required' }}
                    />
                </Box>

                {saveMessage.result && (
                    <Box mt={2} mb={1}>
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