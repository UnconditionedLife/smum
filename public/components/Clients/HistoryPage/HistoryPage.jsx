import React, { useEffect, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { HistoryHeader, HistoryDisplay } from '../../Clients';
import SmumLogo from "../../Assets/SmumLogo";

// const useStyles = makeStyles((theme) => ({
//     tableHeader: {
//         marginTop: "20px",
//         width: "100%",
//         display: "grid",
//         gridTemplateColumns: "1.5fr 1.5fr 1.5fr repeat(7, 1fr)",
//         gridTemplateRows: "repeat(2, 32px)",
//         gridGap: "2px",
//         padding: "2px",
//         textAlign: "center",
//         alignItems: "center",
//         lineHeight: "32px"
//     }
// }))

HistoryPage.propTypes = {
    session: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
}

export default function HistoryPage(props) {
    // const classes = useStyles();
    // const historyDivBottom = useRef(null);

    // useEffect(() => {
    //     if (!isEmpty(client)) {
    //         window.uiBuildHistoryBottom(historyDivBottom.current)
    //         window.dbLoadServiceHistory(historyDivBottom.current)
    //     }
    // })

    if (isEmpty(props.client)) return null

    return (
        <Box width={ 1 } mt={ 7 } >
            <Box mt={ 4 }><HistoryHeader client={ props.client } /></Box>
            <Box mt={ 4 }><HistoryDisplay { ...props } />
            </Box>
            {/* <div className={classes.tableHeader} ref={ historyDivBottom }></div> */}
        </Box>
    );

}