import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getButtonData } from '../../System/js/Clients/Services'
import { Button } from '../../System';
import { isEmpty } from '../../System/js/GlobalUtils.js';

SecondaryButtons.propTypes = {
    client: PropTypes.object.isRequired,
    updateClient: PropTypes.func.isRequired,
    handleAddSvc: PropTypes.func.isRequired,
}

export default function SecondaryButtons(props) {
    const client = props.client
    const handleAddSvc = props.handleAddSvc
    const [ buttons, setButtons ] = useState([])

    useEffect(() => {
        const buttonData = getButtonData({ client: client, buttons: "secondary" })

        if (isEmpty(buttonData.secondary)) return null

        let btns = []
        if (buttonData.secondary == "-1") { // dependents grades requirement
            let btnClass = "btnAlert"
            btns += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
        } else {
            for (let i=0; i < buttonData.secondary.length; i++){
                let x = buttonData.secondary[i]
                // let btnClass = "btnSecondary"
                // let attribs = "\'" + buttonData.activeServiceTypes[x].serviceTypeId + "\', \'" + buttonData.activeServiceTypes[x].serviceCategory + "\', \'" + buttonData.activeServiceTypes[x].serviceButtons + "\'";
                btns.push(buttonData.activeServiceTypes[x])
            }
        }
        setButtons(btns)
    },[ props.client.lastServed ])

    return (
        <Fragment>
            {buttons.map((service) => {
                return (
                    <Button key={ service.serviceTypeId } m={ .5 } variant="outlined" color="primary" size="large" minWidth="168px"
                        onClick={ () => handleAddSvc(service.serviceTypeId, 
                            service.serviceCategory, service.serviceButtons) }
                    >
                        { service.serviceName }
                    </Button>
                )
            })}
        </Fragment>
    )
}