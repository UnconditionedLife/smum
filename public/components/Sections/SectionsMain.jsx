import React from "react";
import { hot } from 'react-hot-loader'
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './Theme.jsx'
import SearchNavBarContainer from "./SearchNavBarContainer.jsx";
import {BrowserRouter as Router} from "react-router-dom";

const container = {
    width: '100%',
    maxHeight: '100vh',
    overflowY: 'none',
    marginTop: 70,
};

function SectionsMain(){
    return (
        <div style={ container }>
            <ThemeProvider theme={ theme }>
                <Router>
                    <SearchNavBarContainer />
                </Router>
            </ThemeProvider>
        </div>
    )
};

export default hot(module)(SectionsMain);