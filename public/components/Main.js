import React, { useState } from "react";
import ReactDOM from "react-dom";
import LoginForm from "./Login/LoginForm";
import PrimarySearchAppBar from "./NavigationBar/navbar";
import ClientsPages from "./Clients/Page-Main.jsx";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import deepOrange from '@material-ui/core/colors/deepOrange';

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
    // <SMUMBanner />,
    <PrimarySearchAppBar />,
    document.getElementById("servicePrimaryButtons")
  );

  ReactDOM.render(<LoginForm />, document.getElementById("loginOverlay"));

  ReactDOM.render(
    <ThemeProvider theme={smumTheme}>
      <PrimarySearchAppBar  version="Version 1.0"/ />
    </ThemeProvider>,
    document.getElementById("smum-navbar")
  );

  ReactDOM.render(
    <ThemeProvider theme={smumTheme}>
      <ClientsPages />
    </ThemeProvider>
  , document.getElementById("NewTabs"));
