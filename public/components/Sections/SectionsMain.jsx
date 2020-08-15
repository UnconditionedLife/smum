import React from "react";
import { hot } from 'react-hot-loader'
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './Theme.jsx'
import SearchNavBar from "./SearchNavBar.jsx";


// const smumTheme = createMuiTheme({
//     palette: {
//         primary: { main: green[600] },
//         secondary: { main: deepOrange[900] },
//     }
// });

const container = {
    width: '100%'
};

function SectionsMain(){
    return (
        <div style={ container }>
            <ThemeProvider theme={ theme }>
                <SearchNavBar version="Version 1.0" />
            </ThemeProvider>
        </div>
    )
};

export default hot(module)(SectionsMain);