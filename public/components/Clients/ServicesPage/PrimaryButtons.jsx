import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles'
import { Box, ButtonBase } from '@material-ui/core';
import { Typography } from '../../System';
import { getButtonData } from '../../System/js/Clients/Services'

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      minWidth: 300,
      width: '100%',
      borderRadius: '20px',
    },
    image: {
      position: 'relative',
      margin: 0,
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
    client: PropTypes.object.isRequired, 
    updateClient: PropTypes.func.isRequired,
    handleAddSvc: PropTypes.func.isRequired,
}

export default function PrimaryButtons(props) {
    const client = props.client
    const handleAddSvc = props.handleAddSvc
    const classes = useStyles();    
    // const [ buttonList, setButtonList ] = useState([])
    const [ buttons, setButtons ] = useState([])
    // const [ buttonState, setButtonState ] = useState([])
    // const [ update, setUpdate ] = useState(false)
    const [ clickedButton, setClickedButton ] = useState(null)

    useEffect(() => {
        const newButtonList = getButtonData({ client: client, buttons: 'primary' })

        if (newButtonList.primary !== undefined) {
            let btns = []
            if (newButtonList.primary === "-1") { // dependents grades requirement === -1
                // TODO TURN THIS INTO SERVICE TYPE
                let btnClass = "btnAlert"
                btns += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
            } else {
                let hasClickedButton = undefined
                if (clickedButton !== null) hasClickedButton = false

                newButtonList.primary.forEach((svcIndex) => {
                    const theButton = newButtonList.activeServiceTypes[svcIndex]
                    const svcCategory = theButton.serviceCategory
                    theButton.btnType = "normal"
                    if ((svcCategory === "Administration") || (theButton.isUSDA == "Emergency")) {
                        theButton.btnType = "highlight"
                    }
                    if (hasClickedButton === false) {
                        if (clickedButton ===  theButton.serviceTypeId) {
                            hasClickedButton = true
                        }
                    }
                    btns.push(theButton)
                })
                if (buttons !== btns) setButtons(btns)

                if (hasClickedButton === false) {
                    setClickedButton(null)
                }
            }
        }
    },[ props.client.lastServed ])

    // useEffect(() => {
    //     const tempSvcsRendered = props.client.svcsRendered
    //     if (tempSvcsRendered !== svcsRendered) {
    //         setSvcsRendered(tempSvcsRendered)
    //     }
    // })

    // const handleButtonState = (serviceTypeId, newState) => {
    //     let array = buttonState
    //     if (newState === 'used') {
    //         array.push(serviceTypeId)
    //     } else {
    //         const index = array.indexOf(serviceTypeId);
    //         if (index !== -1) array.splice(index, 1)
    //     }
    //     setButtonState(array)
    // }

    // WAS USED TO DO UNDO -- REMOVED FOR NOW
    // function handleUndoService(serviceTypeId, serviceCategory, serviceButtons){

    //     console.log('UNDO SERVICE')
        
    //     return null

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

// console.log("CLICKED", clickedButton)

    const buttonStyleNormal = { padding: '0', margin: '4px', border: 'solid Gainsboro 5px', borderRadius: '15px', overflow: 'hidden' }
    const buttonStyleHighlight = Object.assign({}, buttonStyleNormal)
    buttonStyleHighlight.border = 'solid red 5px'
    
    if (buttons.length === 0) {
        return (
            <Box height="168px" display="flex" alignItems="center" >
                <Box>
                <Typography color="secondary"><strong>NO FOOD SERVICE AVAILABLE TODAY</strong></Typography>
                </Box>
            </Box>
        )
    }

    return (
        <Fragment>
        { buttons.map((button) => (
            <Fragment key={ button.serviceTypeId }>
                { (button.btnType === 'normal') &&
                    <Box style={ buttonStyleNormal }>
                        <ButtonBase
                            focusRipple
                            key={ button.serviceTypeId }
                            className={ classes.image }
                            focusVisibleClassName={ classes.focusVisible }
                            onClick={ () => handleAddSvc(button.serviceTypeId, 
                                button.serviceCategory, button.serviceButtons) }
                        >
                               
                            { (button.serviceTypeId !== clickedButton ) &&
                                <>
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
                                </>
                            }

                            { (button.serviceTypeId === clickedButton ) &&
                                <>
                                <span className={classes.imageSrc}
                                style={{ backgroundImage: "url(/" + button.serviceCategory + ".jpg)" }} />
                                <span className={classes.imageBackdrop} />
                                <span className={classes.imageButton}>
                                <Typography component="span" variant="button" color="inherit"
                                className={classes.imageTitle} >
                                <strong>SAVING...</strong>
                                <span className={classes.imageMarked} />
                                </Typography>
                                </span>
                                </>
                            }

                        </ButtonBase>
                    </Box>
                }

                { (button.btnType === 'highlight') &&
                    <Box style={ buttonStyleHighlight }>
                        <ButtonBase
                            focusRipple
                            key={ button.serviceTypeId }
                            className={ classes.image }
                            focusVisibleClassName={ classes.focusVisible }
                            onClick={ () => handleAddSvc(button.serviceTypeId, 
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
                    </Box>
                }

                {/* WAS USED FOR UNDO REMOVED FOR NOW
                
                    { (button.btnType === 'undo') &&
                    <Box key={ svcsRendered[0].servicedDateTime } m={ .5 } p={ 0 } width='168px' height='168px' bgcolor='#FFF' display='flex' >
                            <Button m={ 0 } width='168px' height='168px' color='primary' style={{ border: '5px dashed #ddd' }}
                                onClick={ () => handleAddService(button.serviceTypeId, 
                                    button.serviceCategory, button.serviceButtons) }>
                                <strong> { "UNDO " + button.serviceName.toUpperCase() }</strong>
                            </Button>
                    </Box>
                } */}

            </Fragment>
        ))}
       </Fragment>
    );
}