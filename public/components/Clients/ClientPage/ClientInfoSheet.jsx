import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import { Box, Tooltip } from '@material-ui/core';
import { Print } from '@material-ui/icons';
import { Fab, Typography } from '../../System';
import moment from 'moment';


// This component must be implemented with a class in order to use the ref property.
class ClientInfoSheet extends React.PureComponent {
    render() {
        const client = this.props.client;

        return (
            <Box m={2}>
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

                <Typography><b>Financial Information</b></Typography>
                
                <table>
                    <tbody>
                        <tr>
                            <td><Typography><b>Income:</b></Typography></td>
                            <td><Typography>${client?.financials?.income} / month</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography><b>Rent:</b></Typography></td>
                            <td><Typography>${client?.financials?.rent} / month</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography><b>Food Stamps:</b></Typography></td>
                            <td><Typography>${client?.financials?.foodStamps} / month</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography><b>Other Assistance:</b></Typography></td>
                            <td><Typography>${client?.financials?.govtAssistance} / month</Typography></td>
                        </tr>
                    </tbody>
                </table>

                <Typography>
                    I certify that the information provided above is accurate and true, and I agree to provide
                    additional information upon request. Further, I agree to the policies of the Food Pantry Program of 
                    Santa Maria Urban Ministry.
                </Typography>
                <Typography>
                    <i>Yo certifico que toda la información escrita anteriormente es correcta y verdadera y estoy de
                    acuerdo de proveer información adicional cuando sea pedido. Además, estoy de acuerdo con las
                    polizas del Ministerio Urbano de Santa Maria.</i>
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
    }
}

ClientInfoSheet.propTypes = {
    client: PropTypes.object.isRequired,    // client data
}


PrintClientInfo.propTypes = {
    client: PropTypes.object.isRequired,    // client data
}
function PrintClientInfo(props) {
    const ref = useRef();

    return (
        <>
            <ReactToPrint
                trigger={() => <Tooltip title='Print Client Form' placement="left-start" ><Fab size="medium" align='right'><Print /></Fab></Tooltip> }
                content={() => ref.current}
                copyStyles={ false }
            />
            <div style={{ display: 'none' }}>
                <ClientInfoSheet client={ props.client } ref={ ref } />
            </div>
        </>
    );

}

export default PrintClientInfo;