import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@material-ui/core';
import { Card } from '../../System';
import { LastServed, PrimaryButtons, SecondaryButtons, ServiceNotes } from '../';

ServicesPage.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
    svcsRendered: PropTypes.object,
    updateSvcsRendered: PropTypes.func,
}

export default function ServicesPage(props) {
    return (
        <Box display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box width='100%' maxWidth="800px" mt={ 5 } pt={ 0 }>
                <Card width='100%' height='80px'>
                    <Box width='100%' display='flex' p={ 2.5 } justifyContent='center' alignItems='center' flexDirection='column'>
                        <Typography variant='h6' color='textPrimary' align='center' noWrap>AVAILABLE SERVICES</Typography>
                        <LastServed { ...props }/>
                    </Box>
                </Card>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons { ...props } />
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons { ...props } />
                </Box>
            </Box>
            <Box maxWidth="500px" mt={ 5 } justifyContent="center">
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    )
}