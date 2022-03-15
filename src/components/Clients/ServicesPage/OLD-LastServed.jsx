import React from 'react'
import PropTypes from 'prop-types';
import { Typography } from '../../System';
import { Box } from '@material-ui/core';

LastServed.propTypes = {
    lastServed: PropTypes.string.isRequired,
    nextService: PropTypes.string.isRequired
}

export default function LastServed(props) {
    const { lastServed, nextService } = props
    
    return (
        <Box mt={ .75 } display='flex' flexDirection='column' key={ lastServed + nextService }>
            <Box display='flex' justifyContent='right'>
                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                    <span style={{ color:"#ccc" }}>SERVED:&nbsp;</span>{ lastServed }
                </Typography>
            </Box>
            <Box display='flex' justifyContent='right'>
                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                    <span style={{ color:"#ccc" }}>NEXT:&nbsp;</span>{ nextService }
                </Typography>
            </Box>
        </Box>
    )
}