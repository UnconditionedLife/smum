import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { Box, ButtonBase } from '@mui/material';
import { Button, Typography } from '../../System';
import { getButtonData } from '../../System/js/Clients/Services'
import ReplayIcon from '@mui/icons-material/Replay';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';
import Food_Pantry from "../../../../public/images/Food_Pantry.jpg";
import Clothes_Closet from "../../../../public/images/Clothes_Closet.jpg";
import Administration from "../../../../public/images/Administration.jpg";
import Back_To_School from "../../../../public/images/Back_To_School.jpg";
import Christmas from "../../../../public/images/Christmas.jpg";
import Thanksgiving from "../../../../public/images/Thanksgiving.jpg";

// make buttons 168px/176px(used) square for wider than 400px screens
// make buttons 120px/128px(used) square for narrower than 400px screens 


PrimaryButtons.propTypes = {
    client: PropTypes.object.isRequired, 
    updateClient: PropTypes.func.isRequired,
    handleAddSvc: PropTypes.func.isRequired,
    handleUndoSvc: PropTypes.func.isRequired,
    lastServedFoodDate: PropTypes.object,
    lastServedDays: PropTypes.object,
    activeServiceTypes: PropTypes.array,
    targetServices: PropTypes.array,
}

export default function PrimaryButtons(props) {
    const { client, lastServedFoodDate, activeServiceTypes, 
        targetServices, lastServedDays, handleAddSvc, handleUndoSvc } = props
    // const handleAddSvc = props.handleAddSvc
    // const handleUndoSvc = props.handleUndoSvc

console.log("AST", activeServiceTypes);
console.log("TARGET SVCS", targetServices);

    const [ buttons, setButtons ] = useState([]);

    let buttonSizes = [ 168, '168px !important', 176 ]
    if (UseWindowSize().width < 468) buttonSizes = [ 120, '120px !important', 128 ]
    
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
          width: buttonSizes[0],
          height: buttonSizes[0],
            [theme.breakpoints.down('sm')]: {
            width: buttonSizes[1], // Overrides inline-style
            height: buttonSizes[0],
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
          padding: `${theme.spacing(2)} ${theme.spacing(2)} calc(${theme.spacing(1)} + 6px)`,
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
    
    const classes = useStyles();

    // wait for lastServedDay
    if (lastServedDays === null ) return null

    useEffect(() => {
        const buttonData = getButtonData({ client, buttons: 'primary', lastServedFoodDate, 
            lastServedDays, activeServiceTypes, targetServices })

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
            <Fragment key={ svc.svcTypeId + "-" + svc.btnType }>
                { (svc.btnType === 'normal') &&
                    <Box style={ buttonStyleNormal }>
                        <ButtonBase
                            focusRipple
                            key={ svc.svcTypeId }
                            className={ classes.image }
                            focusVisibleClassName={ classes.focusVisible }
                            onClick={ () => handleAddSvc(svc.svcTypeId, 
                                svc.svcCat, svc.svcBtns) }>
                                <>
                                    <span className={ classes.imageSrc }
                                    style={{ backgroundImage: `url(${ 
                                        ( svc.svcCat === "Food_Pantry" ) ? Food_Pantry : 
                                        ( svc.svcCat === "Clothes_Closet" ) ? Clothes_Closet : 
                                        ( svc.svcCat === "Administration" ) ? Administration : 
                                        ( svc.svcCat === "Back_To_School" ) ? Back_To_School : 
                                        ( svc.svcCat === "Thanksgiving" ) ? Thanksgiving : 
                                        ( svc.svcCat === "Christmas" ) ? Christmas : "" })` }} />
                                    <span className={classes.imageBackdrop} />
                                    <span className={classes.imageButton}>
                                    <Typography component="span" variant="button" color="inherit"
                                    className={classes.imageTitle} >
                                    <strong>{ svc.svcName.toUpperCase() }</strong>
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
                            key={ svc.svcTypeId }
                            className={ classes.image }
                            focusVisibleClassName={ classes.focusVisible }
                            onClick={ () => handleAddSvc(svc.svcTypeId, 
                                svc.svcCat, svc.svcBtns) }
                        >
                            <span className={classes.imageSrc}
                                style={{ backgroundImage: `url(${ 
                                    ( svc.svcCat === "Food_Pantry" ) ? Food_Pantry : 
                                    ( svc.svcCat === "Clothes_Closet" ) ? Clothes_Closet : 
                                    ( svc.svcCat === "Administration" ) ? Administration : 
                                    ( svc.svcCat === "Back_To_School" ) ? Back_To_School : 
                                    ( svc.svcCat === "Thanksgiving" ) ? Thanksgiving : 
                                    ( svc.svcCat === "Christmas" ) ? Christmas : "" })` }} />
                            <span className={classes.imageBackdrop} />
                            <span className={classes.imageButton}>
                                <Typography component="span" variant="button" color="inherit"
                                    className={classes.imageTitle} >
                                    <strong>{ svc.svcName.toUpperCase() }</strong>
                                    <span className={classes.imageMarked} />
                                </Typography>
                            </span>
                        </ButtonBase>
                    </Box>
                }

                { (svc.btnType === 'used') &&
                    <Box m={ .5 } p={ 0 } width={ buttonSizes[2] } height={ buttonSizes[2] } bgcolor='#FFF' display='flex' >
                            <Button m={ 0 } width={ buttonSizes[2] } height={ buttonSizes[2] } color='primary' style={{ borderRadius: '15px', border: '5px dashed #ddd' }}
                                onClick={ () => handleUndoSvc( svc ) } startIcon={<ReplayIcon />}>
                                <strong> { svc.svcName.toUpperCase() }</strong>
                            </Button>
                    </Box>
                }

            </Fragment>
        ))}
       </Fragment>
    );
}