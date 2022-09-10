import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getButtonData } from '../../System/js/Clients/Services'
import { Button } from '../../System';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import ReplayIcon from '@material-ui/icons/Replay';

SecondaryButtons.propTypes = {
    client: PropTypes.object.isRequired,
    updateClient: PropTypes.func.isRequired,
    handleAddSvc: PropTypes.func.isRequired,
    handleUndoSvc: PropTypes.func.isRequired,
    lastServedDays: PropTypes.object,
    activeServiceTypes: PropTypes.array,
    targetServices: PropTypes.array,
}

export default function SecondaryButtons(props) {
    const { client, activeServiceTypes, targetServices, 
            lastServedDays, handleAddSvc, handleUndoSvc } = props
    const [ buttons, setButtons ] = useState([])

    // wait for lastServedDay
    if (lastServedDays === null) return null

    useEffect(() => {
        const buttonData = getButtonData({ client, buttons: "secondary", lastServedDays, activeServiceTypes, targetServices })
        if (isEmpty(buttonData.secondary)) return null
        // do deep comparison before setting state
        if (JSON.stringify(buttons) !== JSON.stringify(buttonData)) {
            setButtons(buttonData)
        }
    },[ JSON.stringify(client.svcHistory) ])

    return (
        <Fragment key={ buttons }>
            {buttons.map((svc) => {
                return (
                    <Fragment key={ svc.svcTypeId }>
                        { (svc.btnType === 'normal') &&
                            <Button key={ svc.svcTypeId } m={ .5 } variant="contained" 
                                color="primary" size="large" minWidth="176px"
                                onClick={ () => handleAddSvc( svc.svcTypeId ) }>
                                    { svc.svcName }
                            </Button>
                        }

                        { (svc.btnType === 'used') &&
                            <Button key={ svc.svcTypeId + "used" } m={ .25 } variant="outlined" 
                                color="primary" size="large" minWidth="176px" startIcon={<ReplayIcon />}
                                onClick={ () => handleUndoSvc(svc) }>
                                    { svc.svcName }
                            </Button>
                        }
                    </Fragment>
                )
            })}
        </Fragment>
    )
}