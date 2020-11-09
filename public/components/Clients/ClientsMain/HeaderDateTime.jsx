import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';

export default function DateTime(props) {
    const size = props.size
    const color = props.color
    const [ dateTime, setDateTime ] = useState(window.moment().format('MMM DD, YYYY - h:mm a'));
      
    useEffect(() => {
         let dateTimer = setInterval(() => setDateTime(window.moment().format('MMM DD, YYYY - h:mm a')), 5000)
   
         // this will clear Timeout when component unmounts
         return () => {
           clearInterval(dateTimer)
         }
    }, [])
    
    return (
        <Typography variant={ size } color={ color } noWrap>
            { dateTime }
        </Typography>
    );
}