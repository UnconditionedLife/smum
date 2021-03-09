import React from 'react';
import NewClientReport from "./NewClientReport.jsx"
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import MomentUtils from '@date-io/moment';

export default function ReportsPage() {

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <div>
                <div><br/></div>
                <div>REPORTS PAGE</div>
                <div><br/><br/></div>

                <NewClientReport></NewClientReport>
            </div>
        </MuiPickersUtilsProvider>
    )
}