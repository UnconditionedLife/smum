import React from 'react';
import PropTypes from 'prop-types';
import { Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../System';
import { UserForm, PasswordForm } from '../User';
import { getSession } from '../System/js/Database';

UserMain.propTypes = {

}

export default function UserMain(props) {
    return (
        <Container maxWidth='md'>
            <Card>
                <CardHeader title="User Profile" />
                <CardContent>
                    <UserForm { ...props } user={ getSession().user } selfEdit />
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