import React from "react";
import ReactDOM from "react-dom";
import HeaderMain from './Header/HeaderMain.jsx';
import { setAppVersion } from "./System/js/Database.js";

// GET VERSION NUMBER FROM PACKAGE.JSON
const packJson = require('../../package.json');
setAppVersion(packJson.version)

ReactDOM.render(
    <HeaderMain />,
    document.getElementById("app")
);