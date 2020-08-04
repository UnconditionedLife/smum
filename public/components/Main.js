import React, { useState } from "react";
import ReactDOM from "react-dom";
import { createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import deepOrange from '@material-ui/core/colors/deepOrange';
import SectionsMain from './Sections/SectionsMain.jsx'

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

ReactDOM.render(
<SectionsMain />,
document.getElementById("app")
);