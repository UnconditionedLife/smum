import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import { navigationAllowed } from '../../System/js/Database';
import { Box, Tooltip } from '@mui/material';
import { Print } from '@mui/icons-material';
import { Fab, Typography } from '../../System';
import moment from 'moment';


// This component must be implemented with a class in order to use the ref property.
const ClientInfoSheet = React.forwardRef((props, ref) => {
    const client = props.client;

    return (
        <Box m={2} ref={ref}>
            <Typography variant="h2" align="center">Santa Maria Urban Ministry</Typography>
            
            <table width="100%">
                <tbody>
                    <tr>
                        <td><Typography><b>Name:</b> {client.givenName + " " + client.familyName}</Typography></td>
                        <td><Typography><b>Client ID:</b> {client.clientId}</Typography></td>
                    </tr>                       
                    <tr>
                        <td><Typography><b>Date of Birth:</b> {client.dob}</Typography> </td>
                    </tr>
                    <tr>
                        <td>
                        <Typography>
                            <b>Address:</b><br/>
                            {(client.homeless == 'YES') ? '(Homeless)' : ''} {client.street}<br/>
                            {client.city}, {client.state} {client.zipcode+client.zipSuffix}
                            </Typography>
                        </td>
                    </tr>
                    <tr>
                        <td><Typography><b>Email:</b> { client.email }</Typography></td>
                        <td><Typography><b>Telephone:</b> { client.telephone }</Typography></td>
                    </tr>
                    <tr>
                        <td><Typography><b>Ethnicity:</b> {client.ethnicGroup} </Typography></td>
                    </tr>
                </tbody>
            </table>
            <Typography><b>Family Members</b></Typography>
            
            <table width="100%">
            <thead>
                <tr>
                    <th align="left"><Typography>Name</Typography></th>
                    <th align="left"><Typography>Relationship</Typography></th>
                    <th align="left"><Typography>Gender</Typography></th>
                    <th align="left"><Typography>Birthdate</Typography></th>
                    <th align="left"><Typography>Age</Typography></th>
                    <th align="left"><Typography>Grade</Typography></th>
                </tr>
            </thead>
            <tbody>
                {(client?.dependents ?? []).map((row) => (row.isActive == 'Active' ? (
                    <tr key={ row.depId } >
                        <td><Typography>{row.givenName} {row.familyName}</Typography></td>
                        <td><Typography>{row.relationship}</Typography></td>
                        <td><Typography>{row.gender}</Typography></td>
                        <td><Typography>{row.dob}</Typography></td>
                        <td><Typography>{row.age}</Typography></td>
                        <td><Typography>{row.grade}</Typography></td>
                    </tr>
                ) : null))}
            </tbody>
            </table>
            <Typography>
                <b>Adults:</b> {client?.family?.totalAdults} &nbsp;
                <b>Children:</b> {client?.family?.totalChildren} &nbsp;
                <b>Seniors:</b> {client?.family?.totalSeniors} &nbsp;
                <b>Other Dependents:</b> {client?.family?.totalOtherDependents}
            </Typography>

            <Typography>
                I certify that the information provided above is accurate and true, and I agree to provide
                additional information upon request. Further, I agree to the policies of 
                Santa Maria Urban Ministry. Signing this is not necessary to receive USDA food distribution.
            </Typography>
            <Typography>
                <i>Yo certifico que toda la información escrita anteriormente es correcta y verdadera y estoy de
                acuerdo de proveer información adicional cuando sea pedido. Además, estoy de acuerdo con las
                polizas del Ministerio Urbano de Santa Maria. Firmar esto no es necesario para recibir la distribución de 
                alimentos del USDA.</i>
                <br/><br/><br/>     
            </Typography>       
                <table width="100%">
                <tbody>
                    <tr>
                        <td><Typography>Signature (Firma) ____________________________________</Typography></td>
                        <td><Typography>Date (Fecha) {moment().format('YYYY-MM-DD')}</Typography></td>
                    </tr>
                </tbody>
                </table>
            <Typography>Last update: {client.updatedDateTime}</Typography>
        </Box>
    );
});
ClientInfoSheet.displayName = "ClientInfoSheet";


ClientInfoSheet.propTypes = {
    client: PropTypes.object.isRequired,    // client data
}


PrintClientInfo.propTypes = {
    client: PropTypes.object.isRequired,    // client data
}
function PrintClientInfo(props) {
    const ref = useRef();
    const printComponent = useReactToPrint({
        content: () => ref.current,
    })

    const handlePrint = () => {
        if (navigationAllowed()) { 
            printComponent()
        }
    }

    return (
        <>
            <div style={{ display: 'none' }}>
                <ClientInfoSheet client={ props.client } ref={ ref } />
            </div>
            <Tooltip title='Print Client Form' placement="left-start" ><Fab onClick={handlePrint} size="small" align='right'><Print /></Fab></Tooltip>
        </>
    );

}

export default PrintClientInfo;