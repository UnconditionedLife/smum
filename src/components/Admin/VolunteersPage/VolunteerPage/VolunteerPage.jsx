import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import VolunteerForm from './VolunteerForm.jsx';
import { dbGetAllVolunteersAsync, dbGetSingleVolunteerAsync } from '../../../System/js/Database';

VolunteerPage.propTypes = {
    volunteerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    clearRecord: PropTypes.func.isRequired,
}

export default function VolunteerPage(props) {
    const [ volunteer, setVolunteer ] = useState(undefined)
    const [ loading, setLoading ] = useState(false);
    const [ dialogOpen, setDialogOpen ] = useState(true);

    function closeDialog() {
        setDialogOpen(false);
        props.clearRecord();
    }

    useEffect(() => {
        if (props.volunteerId) {
            setLoading(true);
            dbGetSingleVolunteerAsync(String(props.volunteerId)).then(volunteer => {
                console.log('Loaded volunteer:', volunteer);
                setVolunteer(volunteer || null);
                setLoading(false);
            }).catch(error => {
                console.error('Error loading volunteer:', error);
                setVolunteer(null);
                setLoading(false);
            });
        } else {
            setVolunteer(null);
            setLoading(false);
        }
    }, [props.volunteerId])

    if (loading || volunteer === undefined) return null

    return (
        <Dialog open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">
                {volunteer == null ? "New Volunteer" : "Edit Volunteer"}
            </DialogTitle>
            <DialogContent>
                <Box>
                    <VolunteerForm onClose={ closeDialog } volunteer={ volunteer } />
                </Box>
            </DialogContent>
        </Dialog>
    );
} 