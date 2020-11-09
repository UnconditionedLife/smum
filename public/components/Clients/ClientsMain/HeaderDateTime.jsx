import React, { useState } from 'react';
import { Typography } from '@material-ui/core';

export default function DateTime(props) {
    const size = props.size
    const color = props.color
    const [ dateTime, setDateTime ] = useState(window.moment().format('MMM DD, YYYY - h:mm a'));

    const handleDateTimeChange = () => {
        setDateTime(window.moment().format('MMM DD, YYYY - h:mm a'))
    }
    setInterval(handleDateTimeChange, 5000);
    
    return (
        <Typography variant={ size } color={ color } noWrap>
            { dateTime }
        </Typography>
    );
}