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


    let [userAttrs, setUserAttrs] = useState({});
    let [cogUser, setCogUser] = useState(null);

    function doSubmit() {
        switch (appState) {
            case 'login':
                doLogin(usernameInput.value, passwordInput.value);
                break;
            case 'initPassword':
                // Must delete read-only attributes email_verified and phone_number_verified
                // from user attributes (second argument). Instead, we just pass an
                // empty attributes object.
                // XXX ensure that password entries match
                cogUser.completeNewPasswordChallenge(newPassword1Input.value, {}, {
                    onSuccess: () => {
                        setMessage("New Password set! Please Login.");
                        setAppState("login");
                        passwordInput.reset();
                        newPassword1Input.reset();
                        newPassword2Input.reset();
                    },
                    onFailure: err => {
                        setMessage(removeErrorPrefix(err));
                    }
                });
                break;
            case 'code':
                // let cogUser = cogSetupUser(usernameInput.value);
                cogUser.confirmRegistration(validationCodeInput.value, true,
                    err => {
                        if (err)
                            setMessage(err.toString());
                        else {
                            setMessage("You're confirmed! Please Login.");
                            setAppState("login");
                        }
                    });
                break;
            case 'newPassword':
                // let cogUser = cogSetupUser(usernameInput.value);
                cogUser.confirmPassword(validationCodeInput.value, newPassword1Input.value, {
                    onSuccess: () => {
                        setMessage("New Password set! Please Login.");
                        setAppState("login");
                        // usernameInput.reset();
                        // passwordInput.reset();
                        validationCodeInput.reset();
                        newPassword1Input.reset();
                        newPassword2Input.reset();
                    },
                    onFailure: err => {
                        setMessage(removeErrorPrefix(err));
                    }
                });
                break;
        }
    }

    function doLogin(username, password) {
        let localCogUser = cogSetupUser(username);
        setCogUser(localCogUser);
        let authDetails = cogSetupAuthDetails(username, password);
        localCogUser.authenticateUser(authDetails, {
            onSuccess: (result) => {
                const authorization = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.idToken.jwtToken,
                };
                const refreshToken = result.refreshToken.token;
                setMessage("");
                authorization.accessToken = result.getAccessToken().getJwtToken()
                authorization.idToken = result.idToken.jwtToken
  
                // set up minimal session for first db call
                cacheSessionVar({ auth: authorization });

                dbGetUserAsync(username)
                    .then (user => {
                        // logout if user is set to Inactive
                        if (user == null || user.isActive == "Inactive") {
                            localCogUser.signOut();
                            setMessage("Sorry, your account is INACTIVE.");
                        } else {
                            // sets session in HeaderBar component
                            props.onLogin({ user: user, auth: authorization, cogUser: localCogUser, refresh: refreshToken });
                            usernameInput.reset();
                            passwordInput.reset();
                            // validationCodeInput.reset();
                            // newPasswordInput.reset();
                        }
                    });
            },
            onFailure: (err) => {
                // let message = undefined
                // let appState = undefined

                setMessage(removeErrorPrefix(err));
                if (err.code == 'UserNotConfirmedException')
                    setAppState('code');

                // if (err == 'Error: Incorrect username or password.') {
                //     message = "Incorrect username or password"
                // } else if (err == 'UserNotFoundException: User does not exist.') {
                //     message = "Username does not exist."
                // } else if (err == 'NotAuthorizedException: Incorrect username or password.') {
                //     message = "Incorrect username or password."
                // } else if (err == 'UserNotConfirmedException: User is not confirmed.') {
                //     appState = "code"
                //     message = "Validation Code is required."
                //     // TODO change login flow to deal with confirmation
                //     // cogUserConfirm() //userName, verificationCode
                // } else if (err == 'NotAuthorizedException: User cannot confirm because user status is not UNCONFIRMED.') {
                //     appState = "login"
                //     message = "No longer UNCONFIRMED"
                // } else if (err == 'PasswordResetRequiredException: Password reset required for the user') {
                //     message = "New Password is required."
                // } else if (err == 'InvalidParameterException: Missing required parameter USERNAME') {
                //     message = "Username is required."
                // }
                // setMessage(message);
                // if (appState)
                //     setAppState(appState);
            },
            newPasswordRequired: (attrs, reqAttrs) => {
                console.log('New password needed. Attrs', attrs)
                console.log('Required', reqAttrs)
                setUserAttrs(attrs);
                setAppState("initPassword")
            }
        });
        }


    function displaySubmitButtons() {
        return (
            <Fragment>
                {appState == "code" || appState == "newPassword" ? (
                    <Button className="textLink" variant="contained" color="primary" style={{ textTransform: "none" }}
                        onClick={() => {
                            // let cogUser = cogSetupUser(usernameInput.value);
                            console.log('User is', usernameInput.value)
                            cogUser.resendConfirmationCode(err => {
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
                        <Button variant="contained" color="primary" style={{ textTransform: "none" }} onClick={ doSubmit } >
                            Login
                        </Button>
                        <Box mt={1}></Box>
                    </Box>
                ) : null}

                {appState == "code" ? (
                    <span>
                        <Button className="textLink" variant="outlined" color="primary" 
                            style={{ textTransform: "none" }} onClick={ doSubmit } >
                            VALIDATE
                        </Button>
                    </span>
                ) : null}

                {appState == "newPassword" ? (
                    <span>
                        <Button className="textLink" variant="outlined" color="primary" 
                            style={{ textTransform: "none" }} onClick={ doSubmit }>
                            SET PASSWORD
                        </Button>
                    </span>
                ) : null}

                {appState == "initPassword" ? (
                    <span>
                        <Button className="textLink" variant="outlined" color="primary" 
                            style={{ textTransform: "none" }} onClick={ doSubmit }>
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
                                    setPasswordDisplay(false);
                                    if (usernameInput.value == "") {
                                        setMessage("Username is required.");
                                    }
                                    // let cogUser = cogSetupUser(usernameInput.value);
                                    setCogUser(cogSetupUser(usernameInput.value));
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