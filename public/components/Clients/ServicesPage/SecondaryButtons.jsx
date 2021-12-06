import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getButtonData } from '../../System/js/Clients/Services'
import { Button } from '../../System';
import { isEmpty } from '../../System/js/GlobalUtils.js';

SecondaryButtons.propTypes = {
    client: PropTypes.object.isRequired,
    updateClient: PropTypes.func.isRequired,
    handleAddSvc: PropTypes.func.isRequired,
    handleUndoSvc: PropTypes.func.isRequired,
}

export default function SecondaryButtons(props) {
    const client = props.client
    const handleAddSvc = props.handleAddSvc
    const handleUndoSvc = props.handleUndoSvc
    const [ buttons, setButtons ] = useState([])

    useEffect(() => {
        const buttonData = getButtonData({ client: client, buttons: "secondary" })
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
                    <Fragment key={ svc.serviceTypeId }>
                        { (svc.btnType === 'normal') &&
                            <Button key={ svc.serviceTypeId } m={ .5 } variant="contained" 
                                color="primary" size="large" minWidth="176px"
                                onClick={ () => handleAddSvc( svc.serviceTypeId ) }>
                                    { svc.serviceName }
                            </Button>
                        }

                        { (svc.btnType === 'used') &&
                            <Button key={ svc.serviceTypeId + "used" } m={ .25 } variant="outlined" 
                                color="primary" size="large" minWidth="176px"
                                onClick={ () => handleUndoSvc(svc) }>
                                    { svc.serviceName }
                            </Button>
                        }
                    </Fragment>
                )
            })}
        </Fragment>
    )
}