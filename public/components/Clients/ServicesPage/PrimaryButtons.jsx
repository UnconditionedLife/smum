import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { AccessibilityNew, ContactMail, Fastfood } from '@material-ui/icons';
import { Button } from '../../System';
import { getButtonData, addService } from '../../System/js/Clients'
import { isEmpty } from '../../System/js/Utils.js';

PrimaryButtons.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function PrimaryButtons(props) {
    const [ buttonState, setButtonState ] = useState({})
    
    const handleButtonState = (serviceTypeId, newState) => {
        let temp = buttonState
        temp[serviceTypeId] = newState
        setButtonState(temp)
    }

    const handleAddService = (serviceTypeId, serviceCategory, serviceButtons) => {
        addService(serviceTypeId, serviceCategory, serviceButtons)
        console.log("Disabled Button " + serviceTypeId)
        handleButtonState(serviceTypeId, true)
        console.log(buttonState)
        console.log(buttonState[serviceTypeId])
    }
    
    if (isEmpty(props.client)) return null
    const buttonType = "primary"
    const buttonData = getButtonData(buttonType)
    // if (isEmpty(buttonData)) return null
    
    let buttons = []
    if (buttonData.primary == "-1") { // dependents grades requirement
        let btnClass = "btnAlert"
        buttons += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
    } else {
        for (let i=0; i < buttonData.primary.length; i++){
            let x = buttonData.primary[i]
            
            let btnColor = "primary"
            if ((buttonData.activeServiceTypes[x].serviceCategory == "Administration") || (buttonData.activeServiceTypes[x].isUSDA == "Emergency")) btnColor = "secondary"
            
            let btnIcon = <Fastfood />
            if (buttonData.activeServiceTypes[x].serviceCategory == "Clothes_Closet") btnIcon = <AccessibilityNew />
            if (buttonData.activeServiceTypes[x].serviceCategory == "Administration") btnIcon = <ContactMail />

            // let attribs = "\'" + buttonData.activeServiceTypes[x].serviceTypeId + "\', \'" + buttonData.activeServiceTypes[x].serviceCategory + "\', \'" + buttonData.activeServiceTypes[x].serviceButtons + "\'";
            // let image = "<img id=\'image-" + buttonData.activeServiceTypes[x].serviceTypeId + "\' src='public/images/PrimaryButton" + buttonData.activeServiceTypes[x].serviceCategory + ".png" + ver + "'>";
            //primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-'+ activeServiceTypes[x].serviceTypeId +'\" onclick=\"clickAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";

            buttonData.activeServiceTypes[x].btnColor = btnColor
            buttonData.activeServiceTypes[x].btnIcon = btnIcon
            buttonData.activeServiceTypes[x].click = "clickAddService(attribs +')"
            buttons.push(buttonData.activeServiceTypes[x])
            // handleButtonState(buttonData.activeServiceTypes[x].serviceTypeId, false)
        }
    }

    return (
        <Fragment>
            {buttons.map((service) => {
                return ( 
                    <Button key={ service.serviceTypeId } width="168px" height="168px" variant="contained" 
                        disabled= { buttonState[service.serviceTypeId] } color={ service.btnColor }
                        size="large" m={ 2 } endIcon={ service.btnIcon }
                        onClick={ () => handleAddService(service.serviceTypeId, service.serviceCategory, service.serviceButtons) }>
                            { service.serviceName }
                    </Button>
                )
            })}
        </Fragment>
    );
};