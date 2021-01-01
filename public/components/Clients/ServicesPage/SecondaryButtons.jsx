import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { getButtonData } from '../../System/js/Clients/Services.js'
import { Button } from '../../System';
import { isEmpty } from '../../System/js/GlobalUtils.js';

SecondaryButtons.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function SecondaryButtons(props) {
    if (isEmpty(props.client)) return null
    const buttonType = "secondary"
    const buttonData = getButtonData(buttonType)
    // if ($.isEmptyObject(buttonData)) return null

    let buttons = []
    if (buttonData.secondary == "-1") { // dependents grades requirement
        let btnClass = "btnAlert"
        buttons += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
    } else {
        for (let i=0; i < buttonData.secondary.length; i++){
            let x = buttonData.secondary[i]
            let btnClass = "btnSecondary"
            if ((buttonData.activeServiceTypes[x].serviceCategory == "Administration") || (buttonData.activeServiceTypes[x].isUSDA == "Emergency")) btnClass = "btnAlert"
            let attribs = "\'" + buttonData.activeServiceTypes[x].serviceTypeId + "\', \'" + buttonData.activeServiceTypes[x].serviceCategory + "\', \'" + buttonData.activeServiceTypes[x].serviceButtons + "\'";
            let image = "<img id=\'image-" + buttonData.activeServiceTypes[x].serviceTypeId + "\' src='public/images/PrimaryButton" + buttonData.activeServiceTypes[x].serviceCategory + ".png" + ver + "'>";
            //primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-'+ activeServiceTypes[x].serviceTypeId +'\" onclick=\"clickAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";
            buttons.push(buttonData.activeServiceTypes[x])
        }
    }

    return (
        <Fragment>
            {buttons.map((service) => {
                return (
                    <Button key={ service.serviceTypeId } m={ .5 } variant="outlined" color="primary" size="large" minWidth="168px">
                    {/* onClick= {buttonData.serviceName}> */}
                        { service.serviceName }
                    </Button>
                )
            })}
        </Fragment>
    )
}