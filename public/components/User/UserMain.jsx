import React from 'react';
import { Box, Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../System';
import { UserForm, PasswordForm } from '../User';
import { getSession } from '../System/js/Database';

export default function UserMain() {
    return (
        <Box width='100%' p={ 2 }>
            <Container maxWidth='md'>
                <Card>
                    <CardHeader title="User Profile" />
                    <CardContent>
                        <UserForm user={ getSession().user } selfEdit />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader title="Change Password" />
                    <CardContent>
                        <PasswordForm />
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}