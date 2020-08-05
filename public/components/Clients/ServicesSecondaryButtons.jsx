import React from 'react';
import Button from '@material-ui/core';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import { getButtonData } from '../js/Clients'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));


export default function SecondaryButtons() {
    console.log("IN SECONDARY BUTTONS")

    if ($.isEmptyObject(client)) return null
    const buttonType = "secondary"
    const buttonData = getButtonData(buttonType)
    // if ($.isEmptyObject(buttonData)) return null

    console.log(buttonData)
    console.log(buttonData.secondary)
    console.log(buttonData.secondary.length)

    const classes = useStyles();
    let buttons = []
    if (buttonData.secondary == "-1") { // dependents grades requirement
        let btnClass = "btnAlert"
        buttons += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
    } else {
        for (let i=0; i < buttonData.secondary.length; i++){
            let x = buttonData.secondary[i]
            console.log(x)
            let btnClass = "btnSecondary"
            console.log(x)
            if ((buttonData.activeServiceTypes[x].serviceCategory == "Administration") || (buttonData.activeServiceTypes[x].isUSDA == "Emergency")) btnClass = "btnAlert"
            console.log(x)
            let attribs = "\'" + buttonData.activeServiceTypes[x].serviceTypeId + "\', \'" + buttonData.activeServiceTypes[x].serviceCategory + "\', \'" + buttonData.activeServiceTypes[x].serviceButtons + "\'";
            console.log(x)
            let image = "<img id=\'image-" + buttonData.activeServiceTypes[x].serviceTypeId + "\' src='public/images/PrimaryButton" + buttonData.activeServiceTypes[x].serviceCategory + ".png" + ver + "'>";
            console.log(x)
            //primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-'+ activeServiceTypes[x].serviceTypeId +'\" onclick=\"clickAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";
            buttons.push(buttonData.activeServiceTypes[x])

            console.log(buttons)
        }
    }
    return (
        <ButtonGroup color="primary">
            { console.log("IN RETURN") }
            {buttons.map((buttonData) => {
                return (
                    <div>
                        <Button color="primary" size="small" className={ classes.margin }>
                            abc
                        {/* <Button color="primary" size="small" onClick= {buttonData.serviceName}> */}
                                {/* {buttonData.serviceName} */}
                        </Button>
                    </div>
                )
            })}
            { console.log("END RETURN") }
        </ButtonGroup>
    );
};