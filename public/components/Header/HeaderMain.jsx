import React, { useState, useEffect } from "react";
import { hot } from 'react-hot-loader'
import { ThemeProvider } from '@material-ui/core/styles';
import { Box, Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { CookiesProvider } from 'react-cookie';
import { HeaderRouter } from "./";
import theme from '../Theme.jsx'
import { BrowserRouter as Router } from "react-router-dom";
import { setGlobalMsgFunc } from "../System/js/Database";
import { beepError } from '../System/js/GlobalUtils';

function HeaderMain(){
    const [ open, setOpen ] = useState(false);
    const [ globalMsg, setGlobalMsg ] = useState("")

    //{ result: 'success', time: props.client.updatedDateTime }


    useEffect(() => {
        setGlobalMsgFunc(openGlobalMsg)
    }, [])

    function openGlobalMsg(severity, msg) {
        setGlobalMsg({ severity: severity, msg: msg })
        if (severity === "error") beepError()
        setOpen(true);
    }

    function closeGlobalMsg(event, reason) {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setGlobalMsg("")
    }

    return (
        <Box style={{ width: '100%', maxHeight: '100vh', overflowY: 'none', marginTop: 70, }}>
            <ThemeProvider theme={ theme }>
                <Router>
                    <CookiesProvider>
                        <HeaderRouter />
                    </CookiesProvider>
                </Router>
            </ThemeProvider>

            <Snackbar open={open} autoHideDuration={9000} onClose={closeGlobalMsg}>
                <Alert onClose={closeGlobalMsg} severity={ globalMsg.severity } >
                       { globalMsg.msg }
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default hot(module)(HeaderMain);