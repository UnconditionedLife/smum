import React from 'react';
import NewClientReport from "./NewClientReport.jsx"
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Button from '../../System/Core/Button.jsx';
import { dbGetEthnicGroupCountAsync } from '../../System/js/Database'

// pick a date util library
import MomentUtils from '@date-io/moment';


export default function ReportsPage() {

const ethnicGroup = "Latino"


function getCount(ethnicGroup) {

    console.log("IN GETCOUNT")
    dbGetEthnicGroupCountAsync(ethnicGroup)
    .then(
        ethnicCount => {
            console.log(ethnicCount)
        }
    )

}

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <div>
                <div><br/></div>
                <div>REPORTS PAGE</div>
                <div><br/><br/></div>

                <Button onClick={ () => getCount(ethnicGroup) }>ETHNIC REPORT</Button>

                <NewClientReport></NewClientReport>
            </div>
        </MuiPickersUtilsProvider>
    )
}