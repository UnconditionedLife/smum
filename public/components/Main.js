import React, { useState } from "react";
import ReactDOM from "react-dom";
import SMUMBanner from "./SMUMBanner/SMUMBanner";
import PrimarySearchAppBar from "./NavigationBar/navbar"

ReactDOM.render(
   <SMUMBanner />,

  document.getElementById("servicePrimaryButtons")
);


ReactDOM.render(
  <PrimarySearchAppBar version="Version 1.0"/>,
  document.getElementById("smum-navbar")
);
