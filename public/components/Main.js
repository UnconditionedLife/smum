import React, { useState } from "react";
import ReactDOM from "react-dom";
import LoginForm from "./Login/LoginForm";
import Search from "./Search/Search";

ReactDOM.render(<Search />, document.getElementById("servicePrimaryButtons"));

ReactDOM.render(<LoginForm />, document.getElementById("loginOverlay"));
