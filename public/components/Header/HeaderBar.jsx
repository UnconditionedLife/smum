import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Box, Dialog, Toolbar, Tooltip, Typography, InputBase, MenuItem, Menu  } from '@material-ui/core';
import { Search, AccountCircle, ExitToApp, Face, People, Today} from '@material-ui/icons';
import { Button } from '../System';
import { Hidden } from '@material-ui/core';
import { LoginForm, SectionsContent }  from '.';
import theme from '../Theme.jsx';
import DbSwitch from './DbSwitch.jsx';
import { useCookies } from 'react-cookie';
import { cogSetupUser, cogGetRefreshToken } from '../System/js/Cognito.js';
import jwt_decode from "jwt-decode";
import SmumLogo from "../Assets/SmumLogo";
import { HeaderDateTime } from '../Clients'
import { cacheSessionVar, clearCache, initCache, showCache } from '../System/js/Database';

const useStyles = makeStyles((theme) => ({
    appName: {
        display: 'none',
        // [theme.breakpoints.up('sm')]: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', flexwrap: 'wrap' },
        // [theme.breakpoints.up('md')]: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', flexwrap: 'wrap' },
        [theme.breakpoints.up('lg')]: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', flexwrap: 'wrap' },
    },
  
    title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: { display: 'block', fontSize: '10px' },
    [theme.breakpoints.up('md')]: { display: 'block', fontSize: '15px' },
    [theme.breakpoints.up('lg')]: { display: 'block', fontSize: '20px' },
  },
//   bar: {
//     position: 'relative',
//     flexShrink: 3,
//     width: '100%',
//     [theme.breakpoints.up('lg')]: {
//       marginLeft: theme.spacing(3),
//       width: 'auto',
//     },
//   },
  search: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(3),
    },
    [theme.breakpoints.down('xs')]: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        minWidth:'170px',
    },
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
    paddingRight: theme.spacing(1),
  },
  inputInput: {
    padding: theme.spacing(1, 0, 1, 1),
    // vertical padding + font size from searchIcon
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.down(425)]: {
        maxWidth: "15ch",
    },
    [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(2),
    },
    [theme.breakpoints.up('lg')]: {
        paddingLeft: theme.spacing(2),
    }
  },
  sectionDesktop: {
    // display: 'none',
    // [theme.breakpoints.up('lg')]: {
    //   display: 'flex',
    //   justifyContent: 'flex-end',
    // },
  },
  buttonContainer: {
    [theme.breakpoints.down('xs')]: {
        marginRight: theme.spacing(0.5),
        marginLeft: theme.spacing(0.5),
    },
  },
  icon: {
    [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(-1),
    },
  },
}));

HeaderBar.propTypes = {
    checkSectionURL: PropTypes.func.isRequired,
    updateRoute: PropTypes.func.isRequired,
    version: PropTypes.string.isRequired,
}

export default function HeaderBar(props) {
    const classes = useStyles();
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [cogUser, setCogUser] = useState(null);
    const [selectedSection, setSelectedSection] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');

    const checkSectionURL = props.checkSectionURL;
    const updateRoute = props.updateRoute;
    const [cookies, setCookie, removeCookie] = useCookies(['user','auth','refresh']);

    let session = cookies.user && cookies.auth && cookies.refresh ? 
          {user:cookies.user, auth:cookies.auth, refresh:cookies.refresh, cogUser: cogUser} : null;
    
    function setSession(newSession) {
        if (newSession) {
            console.log("Init session")
            let decodedTkn = jwt_decode(newSession.auth.accessToken)
            let currTime = new Date()
            //window.utilInitAuth(newSession.auth);
            //window.utilInitSession(newSession.user, newSession.cogUser);
            // Update Local and Global Session vars
            session = newSession
            cacheSessionVar(newSession);
            initCache();
            setCookie("user", JSON.stringify(newSession.user),  { path: '/' })
            setCookie("auth", JSON.stringify(newSession.auth),  { path: '/' })
            setCookie("refresh", JSON.stringify(newSession.refresh),  { path: '/' })
            setCogUser(newSession.cogUser)
            setTimeout(refreshUserSession, decodedTkn.exp*1000 - currTime.getTime() - 1000);
            console.log("End")
        } else {
            removeCookie("user", { path: '/' });
            removeCookie("auth", { path: '/' });
            removeCookie("refresh", { path: '/' });
            // window.utilInitAuth(null);
            setCogUser(null);
            clearCache();
        }
    }

    function refreshUserSession() {
        console.log("Refresh session: " + session)
        if (session != null) {
            let token = cogGetRefreshToken(session.refresh);
            let tempUser = cogSetupUser(cookies.user.userName);
            tempUser.refreshSession(token, function (err, result) {
                let uAuthorization = {};
                uAuthorization.accessToken = result.getAccessToken().getJwtToken();
                let uRefreshToken = result.refreshToken.token;
                uAuthorization.idToken = result.idToken.jwtToken;
                const newSession = { user: session.user, auth: uAuthorization, cogUser: tempUser, refresh: uRefreshToken };
                setSession(newSession);
            });
        }
    }

    useEffect(() => {
        console.log("App Start")
        const newSection = checkSectionURL();
        if (newSection != selectedSection) {
            setSelectedSection(newSection)
        }
        if (session != null) {           
            let decodedTkn = jwt_decode(cookies.auth.accessToken)
            let currTime = new Date()
            let tempUser = cogSetupUser(cookies.user.userName)

            tempUser.getSession(function (err, cogSession) { 
                if (err || !cogSession.isValid() || decodedTkn.exp*1000 < currTime.getTime() ) { 
                    console.log("Logging out")
                    handleLogout(tempUser)
                } else {
                    session.cogUser = tempUser;
                    setSession(session);             
                }
            });
             
        }
    }, []);


    useEffect(() => {
        console.log('Hot Reload');
        showCache();
    }, ["hot"]);

    const handleSectionChange = (newValue) => {
        setSelectedSection(newValue);
        updateRoute(newValue);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    function closeUserMenu() {
        setUserMenuAnchor(null);
    }

    function handleLogout(user) {
        handleSectionChange(0);
        handleSearchTermChange('');
        user.signOut();
        setSession(null);
    }

    function handleSearchTermChange(newValue) {
        if (searchTerm !== newValue) {
            setSearchTerm(newValue);
        }
    }

    const isAdmin = session &&
        (session.user.userRole == 'Admin' || session.user.userRole == 'TechAdmin');


    const appbarControls = (
        <Fragment>
            <Box display='flex' className={classes.search} mr={2} ml={2.5} flexGrow={1.5} justifyContent="flex-start">
                <Box alignItems='flex-start' pointerEvents='none' display='flex' pl={1} pt={0.75}>
                    <Search />
                </Box>
                <InputBase id='searchField' placeholder="Search clients"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                    onKeyPress={event => {
                        if (event.key == "Enter") {
                            if (selectedSection !== 0) handleSectionChange(0)
                            setSearchTerm(event.target.value)
                        }
                    }}
                />
            </Box>
            <Box className={classes.sectionDesktop} justifyContent="flex-end">
            <Button  className={classes.buttonContainer} onClick={() => handleSectionChange(0)} minWidth="30px" startIcon={ <People className={classes.icon}/>  }
                variant={ (selectedSection === 0) ? 'outlined' : 'text' } color="inherit" >
                    {/* flexShrink={2} */}
                <Hidden smDown> Clients </Hidden>
                    </Button>
                    <Button className={classes.buttonContainer} ml= '0' onClick={() => handleSectionChange(1)} minWidth="30px" startIcon={<Face className={classes.icon}/>}
                    disabled={!isAdmin} variant={ (selectedSection === 1) ? 'outlined' : 'text' } color="inherit" >
                        {/* flexShrink={1} */}
                    <Hidden smDown> Admin </Hidden>
                    </Button>
                    <Button className={classes.buttonContainer} ml= '0' onClick={() => handleSectionChange(2)} minWidth="30px" startIcon={<Today className={classes.icon}/>}
                        variant={ (selectedSection === 2) ? 'outlined' : 'text' } color="inherit" >
                            {/* flexShrink={1} */}
                        <Hidden smDown> Today </Hidden>

                    </Button>
                    <Button className={classes.buttonContainer} ml= '0' minWidth="30px" startIcon={<AccountCircle className={classes.icon}/>} style={{ textTransform: 'none' }}
                        aria-label="account of current user" aria-controls={menuId} aria-haspopup="true"
                        onClick={ handleUserMenuOpen }
                        color="inherit"
                        variant={ (selectedSection === 3) ? 'outlined' : 'text' }  >
                            {/* flexShrink={1} */}
                        <Hidden smDown>  {session ? session.user.userName : ''} </Hidden>
                    </Button>
                </Box>
        </Fragment >
    );

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu anchorEl={userMenuAnchor} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(userMenuAnchor)} onClose={() => { closeUserMenu(); }}>
            <MenuItem onClick={() => { closeUserMenu(); handleSectionChange(3); }}>
                <Button startIcon={<AccountCircle />}>Profile</Button>
            </MenuItem>
            <MenuItem onClick={() => { closeUserMenu(); handleLogout(cogUser); }} >
                <Button startIcon={<ExitToApp />}>Logout</Button>
            </MenuItem>
        </Menu>
    );

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={ session == null }>
                <LoginForm onLogin={ (x) => setSession(x) } />
            </Dialog>
            <Box flexGrow={1} >
                <AppBar position="fixed">
                    <Toolbar>
                    <Hidden xsDown> <Tooltip title={props.version}>
                    <Box width='50px' height='50px' bgcolor="#fff" mr={ 2 } p='3px' borderRadius='25px'>
                    <SmumLogo width='44px' height='44px'/> 
                    </Box>
                </Tooltip> </Hidden> 
                        <Box mr={ 4 } mt={ 1 } className={ classes.appName } >
                            <Typography variant='h6' noWrap className={ classes.title } >
                                    Santa Maria Urban Ministry
                            </Typography>
                            <HeaderDateTime color='textPrimary' size='overline' />
                        </Box>
                        {session ? appbarControls : null}
                    </Toolbar>
                </AppBar>
                { renderMenu }
                
                <DbSwitch />
                <SectionsContent searchTerm={ searchTerm } handleSearchTermChange={ handleSearchTermChange } session={ session } />
            </Box>
        </ThemeProvider>
    )
}