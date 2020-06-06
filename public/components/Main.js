import React, { useState } from "react";
import ReactDOM from "react-dom";
import LoginForm from "./Login/LoginForm";
import SMUMBanner from "./SMUMBanner/SMUMBanner";

ReactDOM.render(
  <SMUMBanner />,
  document.getElementById("servicePrimaryButtons")
);

ReactDOM.render(<LoginForm />, document.getElementById("loginOverlay"));
