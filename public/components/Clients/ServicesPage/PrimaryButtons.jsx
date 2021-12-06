import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles'
import { Box, ButtonBase } from '@material-ui/core';
import { Button, Typography } from '../../System';
import { getButtonData, sortButtons } from '../../System/js/Clients/Services'

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
    handleUndoSvc: PropTypes.func.isRequired,
}

export default function PrimaryButtons(props) {
    const client = props.client
    const handleAddSvc = props.handleAddSvc
    const handleUndoSvc = props.handleUndoSvc
    const classes = useStyles();
    const [ buttons, setButtons ] = useState([]);

    useEffect(() => {
        const buttonData = getButtonData({ client: client, buttons: 'primary' })
        // do deep comparison before setting state
        if (JSON.stringify(buttons) !== JSON.stringify(buttonData)) setButtons(buttonData)
    },[ JSON.stringify(client.svcHistory) ])

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
        <Fragment key={ buttons } >
        { buttons.map((svc) => (
            <Fragment key={ svc.serviceTypeId }>
                { (svc.btnType === 'normal') &&
                    <Box style={ buttonStyleNormal }>
                        <ButtonBase
                            focusRipple
                            key={ svc.serviceTypeId }
                            className={ classes.image }
                            focusVisibleClassName={ classes.focusVisible }
                            onClick={ () => handleAddSvc(svc.serviceTypeId, 
                                svc.serviceCategory, svc.serviceButtons) }>
                                <>
                                    <span className={classes.imageSrc}
                                    style={{ backgroundImage: "url(/" + svc.serviceCategory + ".jpg)" }} />
                                    <span className={classes.imageBackdrop} />
                                    <span className={classes.imageButton}>
                                    <Typography component="span" variant="button" color="inherit"
                                    className={classes.imageTitle} >
                                    <strong>{ svc.serviceName.toUpperCase() }</strong>
                                    <span className={classes.imageMarked} />
                                    </Typography>
                                    </span>
                                </>
                        </ButtonBase>
                    </Box>
                }

                { (svc.btnType === 'highlight') &&
                    <Box style={ buttonStyleHighlight }>
                        <ButtonBase
                            focusRipple
                            key={ svc.serviceTypeId }
                            className={ classes.image }
                            focusVisibleClassName={ classes.focusVisible }
                            onClick={ () => handleAddSvc(svc.serviceTypeId, 
                                svc.serviceCategory, svc.serviceButtons) }
                        >
                            <span className={classes.imageSrc}
                                style={{ backgroundImage: "url(/" + svc.serviceCategory + ".jpg)" }} />
                            <span className={classes.imageBackdrop} />
                            <span className={classes.imageButton}>
                                <Typography component="span" variant="button" color="inherit"
                                    className={classes.imageTitle} >
                                    <strong>{ svc.serviceName.toUpperCase() }</strong>
                                    <span className={classes.imageMarked} />
                                </Typography>
                            </span>
                        </ButtonBase>
                    </Box>
                }

                { (svc.btnType === 'used') &&
                    <Box m={ .5 } p={ 0 } width='176px' height='176px' bgcolor='#FFF' display='flex' >
                            <Button m={ 0 } width='176px' height='176px' color='primary' style={{ borderRadius: '15px', border: '5px dashed #ddd' }}
                                onClick={ () => handleUndoSvc( svc ) }>
                                <strong> { "UNDO " + "\n" + svc.serviceName.toUpperCase() }</strong>
                            </Button>
                    </Box>
                }

            </Fragment>
        ))}
       </Fragment>
    );
}