import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat)

export default function DateTime(props) {

    const size = props.size
    const color = props.color
    const [ dateTime, setDateTime ] = useState(dayjs().format('MMMM DD, YYYY - h:mm a'));
      
    useEffect(() => {
         let dateTimer = setInterval(() => setDateTime(dayjs().format('MMMM DD, YYYY - h:mm a')), 5000)
   
         // this will clear Timeout when component unmounts
         return () => {
           clearInterval(dateTimer)
         }
    }, [])
    
    return (
        <Box mt={ -1.5 } display='flex' width='100%' justifyContent='center'>
            <Typography variant={ size } color={ color } noWrap>
                { dateTime }
            </Typography>
        </Box>
    );
}