// LOOK AT CONVERTING TO THIS CODE: https://react.school/material-ui/templates

import React, { useState, Fragment } from "react";
import PropTypes from 'prop-types';
import { cogSetupUser, cogSetupAuthDetails } from '../System/js/Cognito.js';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { Box, Grid, IconButton, InputAdornment, Typography, Link } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Button, TextField, useInput } from '../System';
import SmumLogo from "../Assets/SmumLogo";
import { utilGetCurrentUserAsync } from '../System/js/Database'

LoginForm.propTypes = {
    onLogin: PropTypes.func.isRequired,
}

export default function LoginForm(props) {
    let [showPrimaryForm, setShowPrimaryForm] = useState(true);
    let [passwordDisplay, setPasswordDisplay] = useState(false);
    let [appState, setAppState] = useState("login");
    let [message, setMessage] = useState("");

    let usernameInput = useInput("");
    let passwordInput = useInput("");
    let validationCodeInput = useInput("");
    let newPasswordInput = useInput("");

    function doLogin(username, password) {
        let cogUser = cogSetupUser(username);
        let authDetails = cogSetupAuthDetails(username, password);
        cogUser.authenticateUser(authDetails, {
            onSuccess: (result) => {
                const authorization = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.idToken.jwtToken,
                };
                const refreshToken = result.refreshToken.token;
                setMessage("");
                authorization.accessToken = result.getAccessToken().getJwtToken()
                authorization.idToken = result.idToken.jwtToken
                window.utilInitAuth(authorization)
                utilGetCurrentUserAsync(username)
                    .then (user => {
                        // logout if user is set to Inactive
                        if (user == null || user.isActive == "Inactive") {
                            cogUser.signOut();
                            setMessage("Sorry, your account is INACTIVE.");
                        } else {
                            props.onLogin({ user: user, auth: authorization, cogUser: cogUser, refresh: refreshToken });
                            usernameInput.reset();
                            passwordInput.reset();
                            validationCodeInput.reset();
                            newPasswordInput.reset();
                        }
                    })
            },
            onFailure: (err) => {
                let message = undefined
                let appState = undefined

                if (err == 'Error: Incorrect username or password.') {
                    message = "Incorrect username or password"
                } else if (err == 'UserNotFoundException: User does not exist.') {
                    message = "Username does not exist."
                } else if (err == 'NotAuthorizedException: Incorrect username or password.') {
                    message = "Incorrect username or password."
                } else if (err == 'UserNotConfirmedException: User is not confirmed.') {
                    appState = "code"
                    message = "Validation Code is required."
                    // TODO change login flow to deal with confirmation
                    // cogUserConfirm() //userName, verificationCode
                } else if (err == 'NotAuthorizedException: User cannot confirm because user status is not UNCONFIRMED.') {
                    appState = "login"
                    message = "No longer UNCONFIRMED"
                } else if (err == 'PasswordResetRequiredException: Password reset required for the user') {
                    message = "New Password is required."
                } else if (err == 'InvalidParameterException: Missing required parameter USERNAME') {
                    message = "Username is required."
                }
                setMessage(message);
                if (appState)
                    setAppState(appState);
                }
            })
        }

    function showViewPasswordIcon() {
        return (
            <i
                className="fa fa-eye fa-lg"
                style={{ float: "right" }}
                aria-hidden="true"
                onClick={() => setPasswordDisplay(!passwordDisplay)}
            />
        );
    }

    function displaySubmitButtons() {
        return (
            <Fragment>
                {appState == "code" ? (
                    <Button className="textLink" variant="contained" color="primary" style={{ textTransform: "none" }}
                        onClick={() => {
                            let cogUser = cogSetupUser(usernameInput.value);
                            cogUser.resendConfirmationCode(function (err, result) {
                                if (err)
                                    setMessage(err.toString());
                                else
                                    setMessage("New code has been sent.");
                            });
                        }} >
                        Resend Validation Code
                    </Button>
                ) : null}

                {appState == "login" ? (
                    <Box m={ 2 } display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
                        <Button variant="contained" color="primary" style={{ textTransform: "none" }}
                            onClick={() => {
                                doLogin(usernameInput.value, passwordInput.value);
                            }} >
                            Login
                        </Button>
                        <Box mt={1}></Box>
                    </Box>
                ) : null}

                {appState == "code" ? (
                    <span  >
                        <Button className="textLink" onClick={() => {
                        let cogUser = cogSetupUser(usernameInput.value);
                        cogUser.confirmRegistration(validationCodeInput.value, true,
                            function (err, result) {
                            if (err)
                                setMessage(err.toString());
                            else {
                                setMessage("You're confirmed! Please Login.");
                                setAppState("login");
                            }
                            })
                        }} variant="outlined" color="primary" style={{ textTransform: "none" }}>VALIDATE</Button>
                    </span>
                ) : null}

                {appState == "newPassword" ? (
                    <span>
                        <Button className="textLink" variant="outlined" color="primary" 
                            style={{ textTransform: "none" }}
                            onClick={() => {
                                setPasswordDisplay(false);
                                let cogUser = cogSetupUser(usernameInput.value);
                                cogUser.confirmPassword(validationCodeInput.value, newPasswordInput.value, {
                                    onSuccess: function (result) {
                                    setMessage("New Password set! Please Login.");
                                    setAppState("login");
                                    usernameInput.reset();
                                    passwordInput.reset();
                                    validationCodeInput.reset();
                                    newPasswordInput.reset();
                                },
                                onFailure: function (err) {
                                    if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.") {
                                        setMessage("Too many requests. Try again later!");
                                    } else {
                                        setMessage(err.toString());
                                    }
                                }
                            });
                        }}>
                            SET PASSWORD
                        </Button>
                    </span>
                ) : null}
            </Fragment>
        );
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
                                            onMouseDown={() => setPasswordDisplay(!passwordDisplay)}
                                            edge="end">
                                                {passwordDisplay ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            onKeyDown={event => {
                                if (event.key == "Enter") doLogin(usernameInput.value, passwordInput.value);
                            }}
                        />
                        <Box ml={1}>
                            <Grid item>
                                <Link onClick={() => {
                                    setPasswordDisplay(false);
                                    if (usernameInput.value == "") {
                                        setMessage("Username is required.");
                                    }
                                    let cogUser = cogSetupUser(usernameInput.value);
                                    cogUser.forgotPassword({
                                        onSuccess: function (result) {
                                        setMessage("Validation Code sent to: " + result.CodeDeliveryDetails.Destination);
                                        setAppState("newPassword");
                                    },
                                    onFailure: function (err) {
                                        if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.")
                                            setMessage("Too many requests. Try again later!");
                                        else
                                            setMessage(err.toString());
                                        }
                                    })
                                }} href="#" variant="body2">Forgot password?</Link>
                            </Grid>
                        </Box>
                    </Fragment>
                ) : null }
                {appState == "code" || appState == "newPassword" ? (
                    <Fragment>
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth
                            id="loginCode" label="Login Code" name="loginCode" autoComplete="loginCode"
                            {...validationCodeInput.bind}autoFocus
                        />
                    </Fragment>
                ) : null }
                {appState == "newPassword" ? (
                    <Fragment>
                        <TextField ml='0' variant="outlined" margin="normal" required fullWidth
                            name="newPassword" label="New Password" id="newPassword" autoComplete="newPassword"
                            type={passwordDisplay ? "text" : "password"} {...newPasswordInput.bind}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setPasswordDisplay(!passwordDisplay)}
                                        onMouseDown={() => setPasswordDisplay(!passwordDisplay)}
                                        edge="end"
                                    >
                                    {passwordDisplay ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                                )
                            }}
                            onKeyDown={event => {
                                if (event.key == "Enter")
                                doLogin(usernameInput.value, passwordInput.value);
                            }}
                        />
                    </Fragment>
                ) : null}
            </Fragment>
        )
    }

    return (
        <Box m={ 2 } width="400px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" >
                <SmumLogo mb={ 1 } width='50px' height='50px'/>
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