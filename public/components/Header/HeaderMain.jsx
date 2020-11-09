import React from "react";
import { hot } from 'react-hot-loader'
import { ThemeProvider } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { CookiesProvider } from 'react-cookie';
import { HeaderRouter } from "./";
import theme from '../Theme.jsx'
import { BrowserRouter as Router } from "react-router-dom";

function HeaderMain(){
    return (
        <Box style={{ width: '100%', maxHeight: '100vh', overflowY: 'none', marginTop: 70, }}>
            <ThemeProvider theme={ theme }>
                <Router>
                    <CookiesProvider>
                        <HeaderRouter />
                    </CookiesProvider>
                </Router>
            </ThemeProvider>
        </Box>
    )
}

export default hot(module)(HeaderMain);