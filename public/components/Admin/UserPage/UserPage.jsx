import React from 'react';
import PropTypes from 'prop-types';
import { dbGetUser } from '../../System/js/Database.js';
import { Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../../System';
import { UserForm } from '../../User';

UserPage.propTypes = {
    userName: PropTypes.string.isRequired,
}

export default function UserPage(props) {
    const user = dbGetUser(props.userName);

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