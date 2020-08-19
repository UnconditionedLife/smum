import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef } from 'react';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

export default function ClientPage(props) {
    const client = props.client;
    const isNewClient = props.isNewClient;
    const clientFormDiv = useRef(null);

    useEffect(() => {
        if (!isEmpty(client)) {
            uiShowClientEdit(clientFormDiv.current, false)
        } else if (isNewClient) {
            uiShowClientEdit(clientFormDiv.current, true)
        }
    })

    return (
        <div>
            <div className="topFormButtonsDiv">

                {/* <input id="newClientButton" className="solidButton viewOnly" onclick="clickShowNewClientForm()" type="button" value="New Client"> */}
                {/* <input id="clientLeftSlider" className="leftSlider sliderActive" onclick="clickToggleClientViewEdit('view')" type="button" value="View">
                <input id="clientRightSlider" className="rightSlider" onclick="clickToggleClientViewEdit('edit')" type="button" value="Edit"> */}
            </div>
            <div id="clientFormWrap">
                <div ref={ clientFormDiv }></div>
            </div>
        </div>
    );
};