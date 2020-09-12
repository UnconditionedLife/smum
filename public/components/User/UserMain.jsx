import React from 'react';
import { Box, Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../System';
import { UserForm, PasswordForm } from '../User';

export default function UserMain(props) {
    return (
        <Container maxWidth='md'>
            <Card mb={1} variant="elevation" elevation={8}>
                <CardHeader title="User Profile" />
                <CardContent>
                    <UserForm { ...props }  />
                </CardContent>
            </Card>
            <Card mb={1} variant="elevation" elevation={8}>
                <CardHeader title="Change Password" />
                <CardContent>
                    <PasswordForm { ...props } />
                </CardContent>
            </Card>
            <p>User data: { JSON.stringify(props.user) }</p>
        </Container>
    )
};
