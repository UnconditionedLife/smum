import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { HistoryHeader, HistoryDisplay } from '..';

HistoryPage.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired
}

export default function HistoryPage(props) {
    return (
        <Box width={ 1 } mt={ 7 } >
            <Box mt={ 4 }><HistoryHeader client={ props.client } /></Box>
            <Box mt={ 4 }><HistoryDisplay { ...props } /></Box>
        </Box>
    );
}