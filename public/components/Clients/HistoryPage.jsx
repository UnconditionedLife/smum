import React, { useEffect, useRef, Fragment } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../System/js/Utils.js';
import { HistoryHeader, HistoryDisplay } from '../Clients';

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
    const historyDivBottom = useRef(null);

    useEffect(() => {
        if (!isEmpty(client)) {
            window.uiBuildHistoryBottom(historyDivBottom.current)
            window.dbLoadServiceHistory(historyDivBottom.current)
        }
    })

    return (
        <Fragment >
            <Box mt={ 4 }><HistoryHeader client={ client } /></Box>
            <Box mt={ 4 }><HistoryDisplay client={ client } /></Box>
            <div className={classes.tableHeader} ref={ historyDivBottom }></div>
        </Fragment>
    );
};