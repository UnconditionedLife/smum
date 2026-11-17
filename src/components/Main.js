import React from "react";
import { createRoot } from "react-dom/client";
import HeaderMain from './Header/HeaderMain.jsx';
import { setAppVersion } from "./System/js/Database.js";

// GET VERSION NUMBER FROM PACKAGE.JSON
const packJson = require('../../package.json');
setAppVersion(packJson.version)

createRoot(document.getElementById("app")).render(<HeaderMain />);