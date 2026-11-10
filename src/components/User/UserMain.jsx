import React, { useEffect, useState } from 'react';
import { Box, Container, CardContent, CardHeader } from '@mui/material';
import { Card } from '../System';
import { UserForm, PasswordForm } from '.';
import { dbGetUserAsync, getUserName } from '../System/js/Database';

export default function UserMain() {
    const [userObj, setUser] = useState(null);

    useEffect(() => {
        dbGetUserAsync(getUserName()).then( x => { setUser(x) });
    }, []);

    return (
        <Box
            key={ userObj }
            sx={{
                width: '100%',
            }}>
            <Container maxWidth={ false } disableGutters sx={{ mt: 2, maxWidth: 900, mx: 0 }}>
                <Card sx={{ mb: 2 }}>
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
    );
}