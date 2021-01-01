import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles'
import { Box, ButtonBase } from '@material-ui/core';
import { Button, Typography } from '../../System';
import { getButtonData, addService, getSvcsRendered } from '../../System/js/Clients/Services'
import { getSvcTypes, isEmpty } from '../../System/js/GlobalUtils.js';

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
      width: 168,
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
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
}

export default function PrimaryButtons(props) {
    const client = props.client
    const updateClient = props.updateClient
    const svcsRendered = props.client.svcsRendered

    console.log(svcsRendered)

    // const updateSvcsRendered = props.updateSvcsRendered
    const [ buttonData, setButtonData ] = useState(getButtonData({ client: props.client, buttons: 'primary' }))
    const [ buttonState, setButtonState ] = useState([])
    const [ update, setUpdate ] = useState(false)

    const classes = useStyles();
    // const buttonType = "primary"

    // useEffect(() => { 
    //     setButtonData(getButtonData(buttonType))
    // },[])

    const handleButtonState = (serviceTypeId, newState) => {
        let array = buttonState
        if (newState === 'used') {
            array.push(serviceTypeId)
        } else {
            const index = array.indexOf(serviceTypeId);
            if (index !== -1) array.splice(index, 1)
        }
        setButtonState(array)
    }

    function handleAddService(serviceTypeId, serviceCategory, svcButtons){
        const serviceRecord = addService( { client: client, serviceTypeId: serviceTypeId, 
            serviceCategory: serviceCategory, svcButtons: svcButtons, svcsRendered: svcsRendered })
        if (serviceRecord === undefined) return
        const svcsArray = svcsRendered
        if (serviceRecord === 'undone') {
            svcsArray.splice(svcsArray.indexOf(serviceTypeId), 1)
        } else if (!isEmpty(serviceRecord)) {
            svcsArray.push(serviceRecord)
        }        
        updateSvcsRendered(svcsArray)
        setUpdate(!update)
    }

    function updateSvcsRendered(){
        const newClient = client
        newClient.svcsRendered = getSvcsRendered(client.svcHistory)
        updateClient(newClient)
    } 

    // function handleUndoService(serviceTypeId, serviceCategory, serviceButtons){
    //     console.log('UNDO SERVICE')
    //     const service = window.utilRemoveService(selectedService)
    //     if (service !== ""){
    //         // TODO show alert success message
    //         console.log("Saving removal worked.")
    //         setClientHistory(getServiceHistory())
    //         const result = window.utilUpdateLastServed()
    //         if (result == "failed") return
    //     } else {
    //         // TODO show alert with error message
    //         console.log("Saving delete failed.")
    //         return
    //     }
    // }
    
    if (isEmpty(props.client)) return null    
    
    // if (isEmpty(buttonData)) return null
    
    let buttons = []
    if (buttonData.primary == "-1") { // dependents grades requirement
        // TODO TURN THIS INTO SERVICE TYPE
        let btnClass = "btnAlert"
        buttons += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
    } else {
        for (let i=0; i < buttonData.primary.length; i++){
            let x = buttonData.primary[i]
            const serviceCategory = buttonData.activeServiceTypes[x].serviceCategory
            
            let btnColor = "primary"
            if ((serviceCategory === "Administration") || (buttonData.activeServiceTypes[x].isUSDA == "Emergency")) btnColor = "secondary"
            buttonData.activeServiceTypes[x].btnColor = btnColor
            buttons.push(buttonData.activeServiceTypes[x])
            // handleButtonState(buttonData.activeServiceTypes[x].serviceTypeId, false)
        }
    }

    function isUsed(id){
        if (svcsRendered.length === 0) return false
        if (svcsRendered == undefined) return false
        const index = svcsRendered.map(obj => { return obj.serviceTypeId }).indexOf(id);
        if (index === -1) return false
        return true
    }

    return (
        <Fragment>
        { buttons.map((service) => (
            <Fragment key={ service.serviceTypeId }>
                { isUsed(service.serviceTypeId) === false &&
                    <ButtonBase
                        focusRipple
                        key={ service.serviceTypeId }
                        className={ classes.image }
                        focusVisibleClassName={ classes.focusVisible }
                        onClick={ () => handleAddService(service.serviceTypeId, 
                            service.serviceCategory, service.serviceButtons) }
                    >
                        <span className={classes.imageSrc}
                            style={{ backgroundImage: "url(/" + service.serviceCategory + ".jpg)" }} />
                        <span className={classes.imageBackdrop} />
                        <span className={classes.imageButton}>
                            <Typography component="span" variant="button" color="inherit"
                                className={classes.imageTitle} >
                                <strong>{ service.serviceName.toUpperCase() }</strong>
                                <span className={classes.imageMarked} />
                            </Typography>
                        </span>
                    </ButtonBase>
                }

                { isUsed(service.serviceTypeId) === true &&
                    <Box m={ .5 } p={ 0 } width='168px' height='168px' bgcolor='#ddd' display='flex' >
                            <Button m={ 0 } width='168px' height='168px' color='primary'
                                onClick={ () => handleAddService(service.serviceTypeId, 
                                service.serviceCategory, service.serviceButtons) }>
                                <strong>{ service.serviceName.toUpperCase() }</strong>
                            </Button>

                        {/* <span className={classes.imageButton}>
                            <Typography component="span" variant="button" color="inherit"
                                className={classes.imageTitle} >
                                <strong>{ service.serviceName.toUpperCase() }</strong>
                                <span className={classes.imageMarked} />
                            </Typography>
                        </span> */}
                    </Box>
                }

            </Fragment>
        ))}
       </Fragment>
    );
}