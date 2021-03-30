import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { dbGetUserAsync } from '../../System/js/Database.js';
import { Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../../System';
import { UserForm } from '../../User';

UserPage.propTypes = {
    userName: PropTypes.string.isRequired,
}

export default function UserPage(props) {
    const [ user, setUser ] = useState(null)
    
    useEffect(() => {
        dbGetUserAsync(props.userName).then( userObj => { setUser(userObj) })
    }, [])

    if (user == null) return null

    console.log(user)

    return (
        <Container maxWidth='md'>
            <Card>
                <CardHeader title="User Account" />
                <CardContent>
                    <UserForm user={ user } />
                </CardContent>
            </Card>
        </Container>
    );
}