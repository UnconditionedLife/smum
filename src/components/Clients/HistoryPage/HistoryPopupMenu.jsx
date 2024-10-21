import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box,  Tooltip, Typography } from '@mui/material';
import { Delete, Edit, Cancel, CheckCircle } from '@mui/icons-material';
import { IconButton } from '../../System';

HistoryPopupMenu.propTypes = {
    editMode: PropTypes.string.isRequired,          //  'edit', 'confirm', 'message' ] display form
    handleEditMode: PropTypes.func.isRequired,      //  handles setting edit mode
}

export default function HistoryPopupMenu(props) {
    
    return (
        <Box display="flex" alignItems='center' justifyContent='center' flexDirection='column'>
            <Box display="flex" width="240px" m={ 0 } p={ 0 } alignItems='center' justifyContent='space-between'>
            
                { props.editMode === 'none' && 
                    <Fragment>
                        <Tooltip title= 'Edit Service'>
                            <IconButton ml={ 2 } size="small" onClick={ () => props.handleEditMode('edit') }>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title= 'Remove Service'>
                            <IconButton size="small" onClick={ () => props.handleEditMode('remove') }>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title= 'Cancel'>
                            <IconButton size="small" onClick={ () => props.handleEditMode('cancel') }>
                                <Cancel />
                            </IconButton>
                        </Tooltip>
                    </Fragment>
                }

                {  props.editMode === 'confirm' &&
                    <Fragment>
                        <Typography color='error'>ARE YOU SURE?</Typography>
                        <Tooltip title='Confirm'>
                            <IconButton size="small" onClick={ () => props.handleEditMode('confirm') }>
                                <CheckCircle color='primary' />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title= 'Cancel'>
                            <IconButton size="small" onClick={ () => props.handleEditMode('cancel') }>
                                <Cancel color='error'/>
                            </IconButton>
                        </Tooltip>
                    </Fragment>
                }
                
            </Box>
        </Box>
    )
}