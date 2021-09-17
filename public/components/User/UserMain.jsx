import React, { useEffect, useState } from 'react';
import { Box, Container, CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../System';
import { UserForm, PasswordForm } from '../User';
import { dbGetUserAsync, getSession } from '../System/js/Database';

export default function UserMain() {
    const [userObj, setUser] = useState(null);

    useEffect(() => {
        dbGetUserAsync(getSession().user.userName).then( x => { setUser(x) });
    }, []);

    return (
        <Box width='100%' p={ 2 } key={ userObj }>
            <Container maxWidth='md'>
                <Card>
                    <CardHeader title="User Profile" />
                    <CardContent>
                        <UserForm user={ userObj } selfEdit />
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