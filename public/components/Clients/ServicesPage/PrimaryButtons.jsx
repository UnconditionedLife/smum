import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles'
import { ButtonBase } from '@material-ui/core';
import { AccessibilityNew, ContactMail, Fastfood } from '@material-ui/icons';
import { Button, Typography } from '../../System';
import { getButtonData, addService } from '../../System/js/Clients'
import { isEmpty } from '../../System/js/Utils.js';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      minWidth: 300,
      width: '100%',
    },
    image: {
      position: 'relative',
      margin: 4,
      height: 168,
        [theme.breakpoints.down('xs')]: {
        width: '168px !important', // Overrides inline-style
        height: 168,
      },
      '&:hover, &$focusVisible': {
        zIndex: 1,
        '& $imageBackdrop': {
          opacity: 0.15,
        },
        '& $imageMarked': {
          opacity: 0,
        },
        '& $imageTitle': {
          border: '4px solid currentColor',
        },
      },
    },
    focusVisible: {},
    imageButton: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.common.white,
      borderRadius: '16px',
    },
    imageSrc: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center 40%',
    },
    imageBackdrop: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.palette.common.black,
      opacity: 0.4,
      transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
      position: 'relative',
      padding: `${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
      height: 3,
      width: 18,
      backgroundColor: theme.palette.common.white,
      position: 'absolute',
      bottom: -2,
      left: 'calc(50% - 9px)',
      transition: theme.transitions.create('opacity'),
    },
  }));

PrimaryButtons.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function PrimaryButtons(props) {
    const [ buttonState, setButtonState ] = useState({})

    const classes = useStyles();
    
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
                    // <Button key={ service.serviceTypeId } width="168px" height="168px" variant="contained" 
                    //     disabled= { buttonState[service.serviceTypeId] } color={ service.btnColor }
                    //     size="large" m={ 2 } endIcon={ service.btnIcon }
                    //     onClick={ () => handleAddService(service.serviceTypeId, service.serviceCategory, service.serviceButtons) }>
                    //         { service.serviceName }
                    // </Button>
                    <ButtonBase
                        focusRipple
                        key={ service.serviceTypeId }
                        className={ classes.image }
                        focusVisibleClassName={ classes.focusVisible }
                        disabled= { buttonState[service.serviceTypeId] }
                        style={{ width: '168px', borderRadius: '8px', }}
                        onClick={ () => handleAddService(service.serviceTypeId, service.serviceCategory, service.serviceButtons) }
                  >
                    <span
                      className={classes.imageSrc}
                      style={{ backgroundImage: "url(http://localhost:3002/" + service.serviceCategory + ".jpg)" }}
                    />
                    <span className={classes.imageBackdrop} />
                    <span className={classes.imageButton}>
                      <Typography component="span" variant="button" color="inherit"
                        className={classes.imageTitle}
                      >
                        <strong>{ service.serviceName.toUpperCase() }</strong>
                        <span className={classes.imageMarked} />
                      </Typography>
                    </span>
                  </ButtonBase>
                )
            })}
        </Fragment>
    );
}