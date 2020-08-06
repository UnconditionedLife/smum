import React from "react";
import { hot } from 'react-hot-loader'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import deepOrange from '@material-ui/core/colors/deepOrange';
import PrimarySearchAppBar from "../NavigationBar/navbar";

const smumTheme = createMuiTheme({
    palette: {
        primary: {
            main: green[600],
        },
        secondary: {
            main: deepOrange[900],
        },
    },
});

const container = {
    width: '100vw'
};

function SectionsMain(){
    return (
        <div style={ container }>
            <ThemeProvider theme={ smumTheme }>
                <PrimarySearchAppBar  version="Version 1.0" />
            </ThemeProvider>
        </div>
    )
};

export default hot(module)(SectionsMain);
