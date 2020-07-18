import React, { useState } from "react";
import ReactDOM from "react-dom";
import LoginForm from "./Login/LoginForm";
import SMUMBanner from "./SMUMBanner/SMUMBanner";
import PrimarySearchAppBar from "./NavigationBar/navbar"

ReactDOM.render(
   <SMUMBanner />,
  
  document.getElementById("servicePrimaryButtons")
);

ReactDOM.render(<LoginForm />, document.getElementById("loginOverlay"));

ReactDOM.render(
  <PrimarySearchAppBar />,
  document.getElementById("smum-navbar")
);
