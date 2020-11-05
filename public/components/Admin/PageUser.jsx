import React from 'react';
import PropTypes from 'prop-types';
import { dbGetUser } from '../System/js/database.js';
import { Container, CardContent, CardHeader, Typography } from '@material-ui/core';
import { Card } from '../System';
import { UserForm } from '../User';

export default function UserPage(props) {
    const user = dbGetUser(props.session, props.userName);

    return (
        <Container maxWidth='md'>
            <Card>
                <CardHeader title="User Account" />
                <CardContent>
                    <UserForm session={ props.session } user={ user } />
                </CardContent>
            </Card>
        </Container>
    );
}

UserPage.propTypes = {
    session: PropTypes.object.isRequired,
    userName: PropTypes.string.isRequired,
}