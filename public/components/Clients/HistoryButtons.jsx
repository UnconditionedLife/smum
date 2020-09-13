import React, { useState, Fragment } from 'react';
import { Box,  Tooltip } from '@material-ui/core';
import { Delete, Edit, Cancel } from '@material-ui/icons';
import { IconButton } from '../System';

export default function HistoryButtons(props) {
    const editMode = props.editMode;
    const handleEditModeChange = props.handleEditModeChange;
    
    // const [selectedService, setSelectedService] = useState(null);

    return (
        <Box display="flex" maxWidth={ 1 } m={ -1 } justifyContent='center'>
            <Box display="flex" width="200px" m={ 0 } p={ 0 } justifyContent='space-between'>
            {/* { editMode !== 'edit' && userName === row.noteByUserName &&  */}


                <Tooltip title= 'Edit Service'>
                    <IconButton size="small" onClick={ () => handleEditModeChange('edit') }>
                        <Edit />
                    </IconButton>
                </Tooltip>
            {/* } */}
                <Tooltip title= 'Remove Service'>
                    <IconButton size="small" onClick={ () => handleEditModeChange('remove') }>
                        <Delete />
                    </IconButton>
                </Tooltip>
                <Tooltip title= 'Cancel'>
                    <IconButton size="small" onClick={ () => handleEditModeChange('cancel') }>
                        <Cancel />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    )
};