import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles'
import { Box, ButtonBase } from '@material-ui/core';
import { Button, Typography } from '../../System';
import { getButtonData, addService, getSvcsRendered } from '../../System/js/Clients/Services'
import { isEmpty } from '../../System/js/GlobalUtils.js';
import moment from 'moment';

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
      backgroundColor: theme.palette.common.red,
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
    
    // const updateSvcsRendered = props.updateSvcsRendered
    
    const [ buttonData, setButtonList ] = useState([])
    const [ buttons, setButtons ] = useState([])
    const [ buttonState, setButtonState ] = useState([])
    const [ update, setUpdate ] = useState(false)
    const [ svcsRendered, setSvcsRendered ] = useState(props.client.svcsRendered)

    const classes = useStyles();

    useEffect(() => { 
        setButtonList(getButtonData({ client: props.client, buttons: 'primary' }))
    },[ props.client ])

    useEffect(() => {
        if (buttonData.primary !== undefined) {
            let buts = []
            if (buttonData.primary == "-1") { // dependents grades requirement
                // TODO TURN THIS INTO SERVICE TYPE
                let btnClass = "btnAlert"
                buts += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
            } else {
            buttonData.primary.forEach((svcIndex) => {
                    const theButton = buttonData.activeServiceTypes[svcIndex]
                    const svcCategory = theButton.serviceCategory
                    theButton.btnType = "normal"
                    if ((svcCategory === "Administration") || (theButton.isUSDA == "Emergency")) {
                        theButton.btnType = "highlight"
                    }
                    
                    // handleButtonState(buttonData.activeServiceTypes[x].serviceTypeId, false)
                
                    if ((svcsRendered.length !== 0) && (svcsRendered !== undefined)) {
                        svcsRendered.forEach((obj) => { 


                            console.log("SERVED", obj)

                            if (obj.serviceTypeId === theButton.serviceTypeId) {
                                theButton.btnType = "undo"
                            }
                        })
                    }
                    buts.push(theButton)
                })
                if (buttons !== buts) setButtons(buts)
            }
        }
    },[ buttonData, svcsRendered ])

    useEffect(() => {
        const tempSvcsRendered = props.client.svcsRendered
        if (tempSvcsRendered !== svcsRendered) {
            setSvcsRendered(tempSvcsRendered)
        }
    })

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
        setSvcsRendered(newClient.svcsRendered)
    } 

    function handleUndoService(serviceTypeId, serviceCategory, serviceButtons){

        console.log('UNDO SERVICE')
        
        return null

        const service = window.utilRemoveService(selectedService)
        if (service !== ""){
            // TODO show alert success message
            console.log("Saving removal worked.")
            setClientHistory(getServiceHistory())
            const result = window.utilUpdateLastServed()
            if (result == "failed") return
        } else {
            // TODO show alert with error message
            console.log("Saving delete failed.")
            return
        }
    }
     

    console.log("BUTTON DATA", buttonData)
    console.log("BUTTONS", buttons)
    
    if (buttons.length === 0) return null

    return (
        <Fragment>
        { buttons.map((button) => (
            <Fragment key={ button.serviceTypeId }>
                { (button.btnType === 'normal') &&
                    <ButtonBase
                        focusRipple
                        key={ button.serviceTypeId }
                        className={ classes.image }
                        focusVisibleClassName={ classes.focusVisible }
                        onClick={ () => handleAddService(button.serviceTypeId, 
                            button.serviceCategory, button.serviceButtons) }
                    >
                        <span className={classes.imageSrc}
                            style={{ backgroundImage: "url(/" + button.serviceCategory + ".jpg)" }} />
                        <span className={classes.imageBackdrop} />
                        <span className={classes.imageButton}>
                            <Typography component="span" variant="button" color="inherit"
                                className={classes.imageTitle} >
                                <strong>{ button.serviceName.toUpperCase() }</strong>
                                <span className={classes.imageMarked} />
                            </Typography>
                        </span>
                    </ButtonBase>
                }

                { (button.btnType === 'highlight') &&
                    <ButtonBase
                        focusRipple
                        key={ button.serviceTypeId }
                        className={ classes.image }
                        focusVisibleClassName={ classes.focusVisible }
                        onClick={ () => handleUndoService(button.serviceTypeId, 
                            button.serviceCategory, button.serviceButtons) }
                    >
                        <span className={classes.imageSrc}
                            style={{ backgroundImage: "url(/" + button.serviceCategory + ".jpg)" }} />
                        <span className={classes.imageBackdrop} />
                        <span className={classes.imageButton}>
                            <Typography component="span" variant="button" color="inherit"
                                className={classes.imageTitle} >
                                <strong>{ button.serviceName.toUpperCase() }</strong>
                                <span className={classes.imageMarked} />
                            </Typography>
                        </span>
                    </ButtonBase>
                }

                { (button.btnType === 'undo') &&
                    <Box key={ svcsRendered[0].servicedDateTime } m={ .5 } p={ 0 } width='168px' height='168px' bgcolor='#FFF' display='flex' >
                            <Button m={ 0 } width='168px' height='168px' color='primary' style={{ border: '5px dashed #ddd' }}
                                onClick={ () => handleAddService(button.serviceTypeId, 
                                    button.serviceCategory, button.serviceButtons) }>
                                <strong> { "UNDO " + button.serviceName.toUpperCase() }</strong>
                            </Button>
                    </Box>
                }

            </Fragment>
        ))}
       </Fragment>
    );
}