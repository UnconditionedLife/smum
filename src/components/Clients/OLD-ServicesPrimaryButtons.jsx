import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { getButtonData } from '../System/js/Clients'

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    extendedIcon: {
        marginRight: theme.spacing(4),
    },
}));

export default function PrimaryButtons() {
    
    console.log("IN PRIMARY BUTTONS")

    if ($.isEmptyObject(client)) return null
    const buttonType = "primary"
    const buttonData = getButtonData(buttonType)
    // if ($.isEmptyObject(buttonData)) return null

    console.log(buttonData)
    
    const classes = useStyles();
    let buttons = []
    if (buttonData.primary == "-1") { // dependents grades requirement
        let btnClass = "btnAlert"
        buttons += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
    } else {
        for (let i=0; i < buttonData.primary.length; i++){
            let x = buttonData.primary[i]
            let btnClass = "btnPrimary"
            if ((buttonData.activeServiceTypes[x].svcCat == "Administration") || (buttonData.activeServiceTypes[x].isUSDA == "Emergency")) btnClass = "btnAlert"
            let attribs = "\'" + buttonData.activeServiceTypes[x].serviceTypeId + "\', \'" + buttonData.activeServiceTypes[x].svcCat + "\', \'" + buttonData.activeServiceTypes[x].serviceButtons + "\'";
            let image = "<img id=\'image-" + buttonData.activeServiceTypes[x].serviceTypeId + "\' src='/public/images/PrimaryButton" + buttonData.activeServiceTypes[x].svcCat + ".png" + ver + "'>";
            //primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-'+ activeServiceTypes[x].serviceTypeId +'\" onclick=\"clickAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";
            buttons.push(buttonData.activeServiceTypes[x])
        }
        console.log(buttons)
    }

    // onClick={ service.serviceName }

    return (
        <div>
            {buttons.map((service) => {
                return (
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        className={ classes.margin }
                        >
                            { service.serviceName }
                    </Button>
                )
            })}
        </div>
    );
};