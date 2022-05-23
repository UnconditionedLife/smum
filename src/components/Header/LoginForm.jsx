// LOOK AT CONVERTING TO THIS CODE: https://react.school/material-ui/templates

import React, { useState, Fragment } from "react";
import PropTypes from 'prop-types';
import { cogSetupUser, cogSetupAuthDetails } from '../System/js/Cognito.js';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { Box, Grid, IconButton, InputAdornment, Typography, Link } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Button, TextField, useInput } from '../System';
import SmumLogo from "../Assets/SmumLogo";
import { cacheSessionVar, dbGetUserAsync } from '../System/js/Database';
import { removeErrorPrefix } from '../System/js/GlobalUtils';


LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
}

export default function LoginForm(props) {
    let [passwordDisplay, setPasswordDisplay] = useState(false);
    let [appState, setAppState] = useState("login");
    let [message, setMessage] = useState("");

    let usernameInput = useInput("");
    let passwordInput = useInput("");
    let validationCodeInput = useInput("");
    let newPassword1Input = useInput("");
    let newPassword2Input = useInput("");

    let [savedCogUser, setCogUser] = useState(null);

    function doSubmit() {
        switch (appState) {
            case 'login':
                doLogin(usernameInput.value, passwordInput.value);
                break;
            case 'initPassword':
                if (newPassword1Input.value != newPassword2Input.value) {
                    setMessage('New passwords must match')
                } else {
                    // The second argument is for setting any missing user attributes. However, we
                    // must exclude read-only attributes email_verified and phone_number_verified.
                    // In this case, we just pass an empty attributes object.
                    savedCogUser.completeNewPasswordChallenge(newPassword1Input.value, {}, {
                        onSuccess: () => {
                            setMessage("New Password set! Please log in.");
                            setAppState("login");
                            passwordInput.reset();
                            newPassword1Input.reset();
                            newPassword2Input.reset();
                        },
                        onFailure: err => {
                            setMessage(removeErrorPrefix(err));
                        }
                    });
                }
                break;
            case 'code':
                savedCogUser.confirmRegistration(validationCodeInput.value, true,
                    err => {
                        if (err)
                            setMessage(removeErrorPrefix(err));
                        else {
                            setMessage("You're confirmed! Please Login.");
                            setAppState("login");
                        }
                    });
                break;
            case 'newPassword':
                if (newPassword1Input.value != newPassword2Input.value) {
                    setMessage('New passwords must match')
                } else {
                    savedCogUser.confirmPassword(validationCodeInput.value, newPassword1Input.value, {
                        onSuccess: () => {
                            setMessage("New Password set! Please Login.");
                            setAppState("login");
                            validationCodeInput.reset();
                            newPassword1Input.reset();
                            newPassword2Input.reset();
                        },
                        onFailure: err => {
                            setMessage(removeErrorPrefix(err));
                        }
                    });
                }
                break;
        }
    }

    function doLogin(username, password) {
        let cogUser = cogSetupUser(username);
        setCogUser(cogUser);
        let authDetails = cogSetupAuthDetails(username, password);
        cogUser.authenticateUser(authDetails, {
            onSuccess: (result) => {
                const authorization = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.idToken.jwtToken,
                };
                const refreshToken = result.refreshToken.token;
  
                // set up minimal session for first db call
                cacheSessionVar({ auth: authorization });
                dbGetUserAsync(username)
                    .then (user => {
                        // logout if user is unknown or set to Inactive
                        if (user == null || user.isActive == "Inactive") {
                            cogUser.signOut();
                            setMessage("Sorry, your account is INACTIVE.");
                        } else {
                            // Notify parent of succeessful login
                            props.onLogin({ user: user, auth: authorization, cogUser: cogUser, refresh: refreshToken });
                            usernameInput.reset();
                            passwordInput.reset();
                        }
                    })
                    .catch(() => {
                        cogUser.signOut();
                        setMessage("Sorry, your account is INACTIVE.");
                    });
            },
            onFailure: (err) => {
                setMessage(removeErrorPrefix(err));
                console.log('Login error\n', JSON.stringify(err))
                if (err.code == 'UserNotConfirmedException')
                    setAppState("code");
            },
            newPasswordRequired: () => { // (userAttrs, requiredAttrs)
                setMessage('Please set a new password.');
                setAppState("initPassword")
            }
        });
    }

    function displayLoginForms() {
        return (
            <Fragment>
                { appState == "login" ? (
                    <Fragment>
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth
                            id="username" label="Username" name="username" autoComplete="username" 
                            autoFocus { ...usernameInput.bind } 
                        />
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth 
                            name="password" label="Password" type={passwordDisplay ? "text" : "password"} 
                            id="password" autoComplete="current-password" {...passwordInput.bind}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setPasswordDisplay(!passwordDisplay)}
                                            edge="end">
                                                {passwordDisplay ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            onKeyDown={event => {
                                if (event.key == "Enter") 
                                    doSubmit();
                            }}
                        />
                        <Box ml={1}>
                            <Grid item>
                                <Link onClick={() => {
                                    if (usernameInput.value == "") {
                                        setMessage("Username is required.");
                                    }
                                    else {
                                        let cogUser = cogSetupUser(usernameInput.value);
                                        setCogUser(cogUser);
                                        cogUser.forgotPassword({
                                            onSuccess: function (result) {
                                                setMessage("Validation Code sent to: " + result.CodeDeliveryDetails.Destination);
                                                setAppState("newPassword");
                                            },
                                            onFailure: function (err) {
                                                setMessage(removeErrorPrefix(err));
                                            }
                                        })
                                    }
                                }} href="#" variant="body2">
                                    Forgot password? Reset it.
                                </Link>
                            </Grid>
                        </Box>
                    </Fragment>
                ) : null }
                {appState == "code" || appState == "newPassword" ? (
                    <Fragment>
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth
                            id="loginCode" label="Login Code" name="loginCode" autoComplete="loginCode"
                            {...validationCodeInput.bind} autoFocus
                        />
                    </Fragment>
                ) : null }
                {appState == "newPassword" || appState == "initPassword" ? (
                    <Fragment>
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth
                            name="newPassword1" label="New Password" id="newPassword1" autoComplete="newPassword"
                            type={passwordDisplay ? "text" : "password"} {...newPassword1Input.bind}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setPasswordDisplay(!passwordDisplay)}
                                        edge="end"
                                    >
                                    {passwordDisplay ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                                )
                            }}
                            onKeyDown={event => {
                                if (event.key == "Enter")
                                    doSubmit();
                            }}
                        />
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth
                            name="newPassword2" label="Confirm Password" id="newPassword2" autoComplete="newPassword"
                            type={passwordDisplay ? "text" : "password"} {...newPassword2Input.bind}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setPasswordDisplay(!passwordDisplay)}
                                        edge="end"
                                    >
                                    {passwordDisplay ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                                )
                            }}
                            onKeyDown={event => {
                                if (event.key == "Enter")
                                    doSubmit();
                            }}
                        />
                    </Fragment>
                ) : null}
            </Fragment>
        )
    }

    function displaySubmitButtons() {
        let buttonText = 'Submit';
        
        switch (appState) {
            case 'login':
                buttonText = 'Login';
                break;
            case 'code':
                buttonText = 'Validate';
                break;
            case 'newPassword':
            case 'initPassword':
                buttonText = 'Set Password';
                break;
        }
        return (
            <Fragment>
                {appState == "code" || appState == "newPassword" ? (
                    <Button className="textLink" variant="outlined" color="primary" style={{ textTransform: "none" }}
                        onClick={() => {
                            savedCogUser.resendConfirmationCode(err => {
                                if (err)
                                    setMessage(removeErrorPrefix(err));
                                else
                                    setMessage("New code has been sent.");
                            });
                        }} >
                        Resend Validation Code
                    </Button>
                ) : null}

                <Box m={ 2 } display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
                    <Button variant="contained" color="primary" style={{ textTransform: "none" }} onClick={ doSubmit } >
                        { buttonText }
                    </Button>
                    <Box mt={1}></Box>
                </Box>
            </Fragment>
        );
    }

    return (
        <Box m={ 2 } width="280px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
                <SmumLogo mb={ 1 } width='50px' height='50px' display="solid"/>
                <Typography variant="h6" align="center">
                    Login to <br/> Santa Maria Urban Ministry
                </Typography>
                <form noValidate> { displayLoginForms() } </form>
            </Box>
            { displaySubmitButtons() }
            <Box width='100%' mt={ -1 } mb={ 1.5 }>
                { message ? <Alert severity="error">{ message }</Alert> : '' }
            </Box>
        </Box>
    )
}