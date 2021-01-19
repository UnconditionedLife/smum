import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import { Box, Tooltip } from '@material-ui/core';
import { Print } from '@material-ui/icons';
import { Fab, Typography } from '../../System';
import moment from 'moment';


// This component must be implemented with a class in order to use the ref property.
class ClientInfo extends React.PureComponent {
    render() {
        const client = this.props.client;

        return (
            <Box m={2}>
                <Typography variant="h2" align="center">Santa Maria Urban Ministry</Typography>
                <Typography>
                    <table width="100%">
                    <tbody>
                        <tr>
                            <td><b>Name:</b> {client.givenName + " " + client.familyName}</td>
                            <td><b>Client ID:</b> {client.clientId}</td>
                        </tr>                       
                        <tr>
                            <td><b>Date of Birth:</b> {client.dob} </td>
                        </tr>
                        <tr>
                            <td>
                                <b>Address:</b><br/>
                                {(client.homeless == 'YES') ? '(Homeless)' : ''} {client.street}<br/>
                                {client.city}, {client.state} {client.zipcode+client.zipSuffix}
                            </td>
                        </tr>
                        <tr>
                            <td><b>Email:</b> { client.email }</td>
                            <td><b>Telephone:</b> { client.telephone }</td>
                        </tr>
                        <tr>
                            <td><b>Ethnicity:</b> {client.ethnicGroup} </td>
                        </tr>
                    </tbody>
                    </table>
                </Typography>

                <Typography><b>Family Members</b></Typography>
                <Typography>
                    <table width="100%">
                    <thead>
                        <tr>
                            <th align="left">Name</th>
                            <th align="left">Relationship</th>
                            <th align="left">Gender</th>
                            <th align="left">Birthdate</th>
                            <th align="left">Age</th>
                            <th align="left">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(client?.dependents ?? []).map((row) => (row.isActive == 'Active' ? (
                            <tr key={ row.givenName + row.age } >
                                <td>{row.givenName} {row.familyName}</td>
                                <td>{row.relationship}</td>
                                <td>{row.gender}</td>
                                <td>{row.dob}</td>
                                <td>{row.age}</td>
                                <td>{row.grade}</td>
                            </tr>
                        ) : null))}
                    </tbody>
                    </table>
                    <b>Adults:</b> {client?.family?.totalAdults} &nbsp;
                    <b>Children:</b> {client?.family?.totalChildren} &nbsp;
                    <b>Seniors:</b> {client?.family?.totalSeniors} &nbsp;
                    <b>Other Dependents:</b> {client?.family?.totalOtherDependents}
                </Typography>

                <Typography><b>Financial Information</b></Typography>
                <Typography>
                    <table>
                    <tbody>
                        <tr>
                            <td><b>Income:</b></td>
                            <td>${client?.financials?.income} / month</td>
                        </tr>
                        <tr>
                            <td><b>Rent:</b></td>
                            <td>${client?.financials?.rent} / month</td>
                        </tr>
                        <tr>
                            <td><b>Food Stamps:</b></td>
                            <td>${client?.financials?.foodStamps} / month</td>
                        </tr>
                        <tr>
                            <td><b>Other Assistance:</b></td>
                            <td>${client?.financials?.govtAssistance} / month</td>
                        </tr>
                    </tbody>
                    </table>
                </Typography>

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
                    <table width="100%">
                    <tbody>
                        <tr>
                            <td>Signature (Firma) ____________________________________</td>
                            <td>Date (Fecha) {moment().format('YYYY-MM-DD')}</td>
                        </tr>
                    </tbody>
                    </table>
                </Typography>
                <Typography>Last update: {client.updatedDateTime}</Typography>
            </Box>
        );
    }
}

ClientInfo.propTypes = {
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
                trigger={() => <Tooltip title='Print Client Form'><Fab size="medium" align='right'><Print /></Fab></Tooltip> }
                content={() => ref.current}
                copyStyles={ false }
            />
            <div style={{ display: 'none' }}>
                <ClientInfo client={ props.client } ref={ ref } />
            </div>
        </>
    );

}

export default PrintClientInfo;