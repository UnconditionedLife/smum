// LOOK AT CONVERTING TO THIS CODE: https://react.school/material-ui/templates

import React, { useState } from "react";
import ReactDOM from "react-dom";
import Moment from "react-moment";
import Button from '@material-ui/core/Button';
import { cogSetupUser, cogSetupAuthDetails } from '../System/js/Cognito.js';
import {useInput} from '../Utilities/UseInput.jsx';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { green } from "@material-ui/core/colors";
import theme from './Theme.jsx';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';

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
        authorization.accessToken = result.getAccessToken().getJwtToken()
        authorization.idToken = result.idToken.jwtToken
        window.utilInitAuth(authorization)
        let user = window.utilGetCurrentUser(username)
        // logout if user is set to Inactive
        if (user == null || user.isActive == "Inactive") {
          cogUser.signOut();
          setMessage("Sorry, your account is INACTIVE.");
        } else {
          props.onLogin({user: user, auth: authorization, cogUser: cogUser});
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
        } else if (err == 'InvalidParameterException: Missing required parameter USERNAME'){
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
          <div className="span4 codeDiv">
            <span  >
            <Button className="textLink" onClick={() => {
              let cogUser = cogSetupUser(usernameInput.value);
              cogUser.resendConfirmationCode(function(err, result) {
                if (err)
                  setMessage(err.toString());
                else
                  setMessage("New code has been sent.");
              });
            }} variant="outlined" color="primary" style={{ textTransform: "none" }}>Resend Validation Code</Button>
            </span>
          </div>

        ) : null}
        {appState == "login" ? (
          <div className="span4 codeDiv">
            <span  >
            <Button className="textLink" onClick={() => {
              doLogin(usernameInput.value, passwordInput.value);
            }} variant="outlined" color="primary" style={{ textTransform: "none" }}>Login</Button>
            </span>
          </div>
        
          )
        : null}

        {appState == "code" ? (
          <div className="span4 codeDiv">
            <span  >
            <Button className="textLink" onClick={() => {
              let cogUser = cogSetupUser(usernameInput.value);
              cogUser.confirmRegistration(validationCodeInput.value, true,
                function(err, result) {
                  if (err)
                    setMessage(err.toString());
                  else {
                    setMessage("You're confirmed! Please Login.");
                    setAppState("login");
                  }
                })
            }} variant="outlined" color="primary" style={{ textTransform: "none" }}>VALIDATE</Button>
            </span>
          </div>

        ) : null}

        {appState == "newPassword" ? (

          <div className="span4 codeDiv">
            <span  >
            <Button className = "textLink" onClick={() => {
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
                onFailure: function(err) {
                  if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.") {
                    setMessage("Too many requests. Try again later!");
                  } else {
                    setMessage(err.toString());
                  }
                }
              });
            }} variant="outlined" color="primary" style={{ textTransform: "none" }}>SET PASSWORD</Button>
            </span>
          </div>

        ) : null}
      </React.Fragment>
    );
  }

  const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(-1.5),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.primary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
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
            InputProps = {{
            endAdornment:(
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
            )}}
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
            <Grid container alignItems="center" justify="space-between">
                        <Grid item>
                          <a onClick={() => {
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
                              onFailure: function(err) {
                                if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.")
                                  setMessage("Too many requests. Try again later!");
                                else
                                  setMessage(err.toString());
                              }
                            });
                          }} class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-body2 MuiTypography-colorPrimary" href="#">Forgot password?</a>
                        </Grid>
                    </Grid>
          </React.Fragment>
        
          // <React.Fragment>
          //   < div className="lableDiv loginDiv">Username</div>
          //   <div className="loginDiv">
          //     <input
          //       {...usernameInput.bind}
          //       id="loginUserName"
          //       type="email"
          //       className="inputBox loginForm"
          //       tabIndex="1"
          //     />
          //   </div>
          //   <div className="loginDiv" />
          //   <div className="loginDiv" />
          //   <div className="lableDiv loginDiv">Password</div>
          //   <div className="loginDiv">
          //     <input
          //       {...passwordInput.bind}
          //       id="loginPassword"
          //       type={passwordDisplay ? "text" : "password"}
          //       className="inputBox loginForm"
          //       tabIndex="2"
          //       onKeyDown={event => {
          //         if (event.key == "Enter")
          //           doLogin(usernameInput.value, passwordInput.value);
          //       }}
          //     />{" "}
          //     {showViewPasswordIcon()}
          //   </div>
          // </React.Fragment>
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
          InputProps = {{
          endAdornment:(
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
          )}}
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
        <div className="loginFormDivNikhil">
        <div className={classes.paper}>
            
        <Avatar className={classes.avatar}>
        <LockOutlinedIcon />


      </Avatar>

      <Typography className="span2" component="h2" variant="h6">
      Login to Santa Maria Urban Ministry
      </Typography>

      <div className="span4" />
      <div />
      <form className={classes.form}
      noValidate> {displayLoginForms()} </form>
      </div>
      {displaySubmitButtons()}
        <Box 
        color="var(--red)" fontSize ="16px">
          {message}
        </Box>
      </div>
    </React.Fragment>
  );
}

export default LoginForm;
