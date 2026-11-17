import React from 'react'
import PropTypes from 'prop-types';
import { Typography } from '../../System';
import { Box } from '@mui/material';

LastServed.propTypes = {
    lastServed: PropTypes.string.isRequired,
    nextService: PropTypes.string.isRequired
}

export default function LastServed(props) {
    const { lastServed, nextService } = props
    
    return (
        <Box
            key={ lastServed + nextService }
            sx={{
                mt: .75,
                display: 'flex',
                flexDirection: 'column'
            }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'right'
                }}>
                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                    <span style={{ color:"#ccc" }}>SERVED:&nbsp;</span>{ lastServed }
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'right'
                }}>
                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                    <span style={{ color:"#ccc" }}>NEXT:&nbsp;</span>{ nextService }
                </Typography>
            </Box>
        </Box>
    );
}