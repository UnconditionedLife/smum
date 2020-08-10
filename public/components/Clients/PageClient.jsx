import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

export default function ClientPage(props) {
    const client = props.client;
    const clientFormDiv = useRef(null);

    useEffect(() => {
        if (!isEmpty(client)) {
            const isEdit = true;
            uiShowClientEdit(clientFormDiv.current, isEdit)
            // window.uiGenSelectHTMLTable(clientDiv.current,client.dependents,["givenName","familyName",'relationship','gender', "dob","age", "grade","isActive"],'dependentsTable')
        }
    })

    return (
        <div>
            <div className="topFormButtonsDiv">
                <Button variant="contained" size="medium" color="primary" onClick="window.clickShowNewClientForm()">New Client</Button>

                {/* <input id="newClientButton" className="solidButton viewOnly" onclick="clickShowNewClientForm()" type="button" value="New Client"> */}
                {/* <input id="clientLeftSlider" className="leftSlider sliderActive" onclick="clickToggleClientViewEdit('view')" type="button" value="View">
                <input id="clientRightSlider" className="rightSlider" onclick="clickToggleClientViewEdit('edit')" type="button" value="Edit"> */}
            </div>
            <div id="clientFormWrap">
                <container ref={ clientFormDiv }></container>
            </div>
        </div>
    );
};