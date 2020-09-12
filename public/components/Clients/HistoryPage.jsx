import React, { useEffect, useRef } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../System/js/Utils.js';

const useStyles = makeStyles((theme) => ({
    tableHeader: {
        marginTop: "20px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1.5fr 1.5fr 1.5fr repeat(7, 1fr)",
        gridTemplateRows: "repeat(2, 32px)",
        gridGap: "2px",
        padding: "2px",
        textAlign: "center",
        alignItems: "center",
        lineHeight: "32px"
    }
}))

export default function PageHistory(props) {
    const client = props.client;
    const classes = useStyles();
    const historyDivTop = useRef(null);
    const historyDivBottom = useRef(null);

    useEffect(() => {
        if (!isEmpty(client)) {
            window.uiBuildHistoryTop(historyDivTop.current)
        }
    })

    useEffect(() => {
        if (!isEmpty(client)) {
            window.uiBuildHistoryBottom(historyDivBottom.current)
            window.dbLoadServiceHistory(historyDivBottom.current)
        }
    })

    return (
        <Box mt={ 4 }>
            <div ref={ historyDivTop }></div>
            <div><br/></div>
            <div className={classes.tableHeader} ref={ historyDivBottom }></div>
        </Box>
    );
};