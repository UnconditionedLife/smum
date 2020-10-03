// LOOK AT CONVERTING TO THIS CODE: https://react.school/material-ui/templates

import React, { useState } from "react";
import ReactDOM from "react-dom";
import Moment from "react-moment";
import { cogSetupUser, cogSetupAuthDetails } from '../System/js/Cognito.js';
import { useInput } from '../System';
import { makeStyles } from '@material-ui/core/styles';
import theme from './Theme.jsx';
import { Visibility, Error, VisibilityOff, LockOutlined } from '@material-ui/icons';
import { Box, Grid, IconButton, InputAdornment, Typography, Avatar, Card, Link } from '@material-ui/core';
import { Button, TextField } from '../System';

function LoginForm(props) {
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
        let authorization = {};
        setMessage("");
        authorization.accessToken = result.getAccessToken().getJwtToken()
        authorization.idToken = result.idToken.jwtToken
        window.utilInitAuth(authorization)
        let user = window.utilGetCurrentUser(username)
        // logout if user is set to Inactive
        if (user == null || user.isActive == "Inactive") {
          cogUser.signOut();
          setMessage("Sorry, your account is INACTIVE.");
        } else {
          props.onLogin({ user: user, auth: authorization, cogUser: cogUser });
          usernameInput.reset();
          passwordInput.reset();
          validationCodeInput.reset();
          newPasswordInput.reset();
          window.utilInitSession(user, cogUser);
        }
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
      <React.Fragment>
        {appState == "code" ? (


          <Button className="textLink" onClick={() => {
            let cogUser = cogSetupUser(usernameInput.value);
            cogUser.resendConfirmationCode(function (err, result) {
              if (err)
                setMessage(err.toString());
              else
                setMessage("New code has been sent.");
            });
          }} variant="contained" color="primary" style={{ textTransform: "none" }}>Resend Validation Code</Button>


        ) : null}
        {appState == "login" ? (
          <Box ml={16}>
            <Button onClick={() => {
              doLogin(usernameInput.value, passwordInput.value);
            }} variant="contained" color="primary" style={{ textTransform: "none" }}>Login</Button>
            <Box mt={1}>
            </Box>
          </Box>

        )
          : null}

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

          <span  >
            <Button className="textLink" onClick={() => {
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
            }} variant="outlined" color="primary" style={{ textTransform: "none" }}>SET PASSWORD</Button>
          </span>

        ) : null}
      </React.Fragment>
    );
  }

  const useStyles = makeStyles((theme) => ({
    avatar: {
      backgroundColor: theme.palette.primary.main,
    },
  }));

  const classes = useStyles();
  function displayLoginForms() {
    return (
      <React.Fragment>
        {/*<div className="loginHeader span4">
        Login to Santa Maria Urban Ministry
        </div> */}

        {appState == "login" ? (
          <React.Fragment>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              {...usernameInput.bind}
              autoFocus
            />
            <TextField
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
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={passwordDisplay ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              {...passwordInput.bind}
              onKeyDown={event => {
                if (event.key == "Enter")
                  doLogin(usernameInput.value, passwordInput.value);
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
                  });
                }} href="#" variant="body2">Forgot password?</Link>
              </Grid>
            </Box>

          </React.Fragment>


        ) : null}
        {appState == "code" || appState == "newPassword" ? (
          <React.Fragment>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="loginCode"
              label="Login Code"
              name="loginCode"
              autoComplete="loginCode"
              {...validationCodeInput.bind}
              autoFocus
            />
          </React.Fragment>
        ) : null}

        {appState == "newPassword" ? (
          <React.Fragment>
            <TextField
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
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={passwordDisplay ? "text" : "password"}
              id="newPassword"
              autoComplete="newPassword"
              {...newPasswordInput.bind}
              onKeyDown={event => {
                if (event.key == "Enter")
                  doLogin(usernameInput.value, passwordInput.value);
              }}
            />

          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Card className="loginFormDivNikhil">

        <Box mt={-1.5} display="flex" flexDirection="column" alignItems="center" className={classes.paper}>
          <Box m={1} >
            <Avatar className={classes.avatar} >
              <LockOutlined />
            </Avatar>
          </Box>

          <Typography component="h2" variant="h6">
            Login to Santa Maria Urban Ministry
        </Typography>

          <Box />
    
          <form
            noValidate> {displayLoginForms()} </form>
        </Box>
        {displaySubmitButtons()}
        <Box m={1} mr={1} mt={1.75}>
          <Typography color="error" style={{ fontSize: 12 }}>
            {message ? <Error style={{ fontSize: 15 }} /> : ""}
            {message}
          </Typography>
        </Box>
      </Card>
    </React.Fragment>
  );
}

export default LoginForm;
