import React from 'react';
import PropTypes from 'prop-types';
import { Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../System';
import { UserForm, PasswordForm } from '../User';

UserMain.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function UserMain(props) {
    return (
        <Container maxWidth='md'>
            <Card>
                <CardHeader title="User Profile" />
                <CardContent>
                    <UserForm { ...props } user={ props.session.user } selfEdit />
                </CardContent>
            </Card>
            <Card>
                <CardHeader title="Change Password" />
                <CardContent>
                    <PasswordForm { ...props } />
                </CardContent>
            </Card>
        </Container>
    )
}