import React, { useState } from "react";
import Moment from "react-moment";
import Button from '@material-ui/core/Button';

function SMUMBanner() {
  return (
      <div className="bannerDiv">
        <span className="bannerText">SEARCH FOR A PERSON</span>
        <Button variant="contained" color="primary">
          Hello World
        </Button>
      </div>
  );
}

export default SMUMBanner;
