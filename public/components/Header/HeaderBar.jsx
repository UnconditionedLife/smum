import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Box, Dialog, Toolbar, Tooltip, IconButton, Typography, InputBase, MenuItem, Menu  } from '@material-ui/core';
import { MoreVert, Search, AccountCircle, ExitToApp, Face, People, Today} from '@material-ui/icons';
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
// import { dbGetSettings } from '../System/js/Database';
import { cacheSessionVar, cacheSettingsVar } from '../System/js/GlobalUtils';
import { prnConnect } from '../System/js/Clients/Receipts'

const useStyles = makeStyles((theme) => ({
    appName: {
        display: 'none',
        [theme.breakpoints.up('sm')]: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', flexwrap: 'wrap' },
        [theme.breakpoints.up('md')]: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', flexwrap: 'wrap' },
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
    [theme.breakpoints.up('xs')]: {
      marginLeft: theme.spacing(3),
    },
  },
  inputRoot: {
    color: 'inherit',
    width: '200px',
  },
  inputInput: {
    padding: theme.spacing(1, 0, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('lg')]: {
        width: '35ch',
      },
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
    [theme.breakpoints.up('sm')]: {
        width: '20ch',
      },
    [theme.breakpoints.up('xs')]: {
    width: '15ch',
    },
  },
  sectionDesktop: {
    // display: 'none',
    // [theme.breakpoints.up('lg')]: {
    //   display: 'flex',
    //   justifyContent: 'flex-end',
    // },
  },
  sectionMobile: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
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
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const [cogUser, setCogUser] = useState(null);
    const [selectedSection, setSelectedSection] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');

    const checkSectionURL = props.checkSectionURL;
    const updateRoute = props.updateRoute;
    const [cookies, setCookie, removeCookie] = useCookies(['user','auth','refresh']);

    const session = cookies.user && cookies.auth && cookies.refresh ? 
          {user:cookies.user,auth:cookies.auth, refresh:cookies.refresh, cogUser: cogUser} : null;
    
    // Temporary while migrating to cached variables
    if (session !== null) {
        cacheSessionVar(session)
        cacheSettingsVar()
        prnConnect()
    }

    const setSession = (newSession) => {
        console.log("Start")
        if (newSession.user != null && newSession.auth != null) {
            let decodedTkn = jwt_decode(newSession.auth.accessToken)
            let currTime = new Date()
            console.log( decodedTkn.exp*1000 - currTime.getTime() - 1000)
            window.utilInitAuth(newSession.auth)
            window.utilInitSession(newSession.user, newSession.cogUser);
            console.log("Partial end...")
            setCookie("user", JSON.stringify(newSession.user),  { path: '/' })
            setCookie("auth", JSON.stringify(newSession.auth),  { path: '/' })
            setCookie("refresh", JSON.stringify(newSession.refresh),  { path: '/' })
            setCogUser(newSession.cogUser)
            setTimeout(refreshUserSession, decodedTkn.exp*1000 - currTime.getTime() - 1000)
            console.log(newSession)
            cacheSessionVar(newSession)
            cacheSettingsVar()
            prnConnect()
        } else {
            removeSession()
        }
        console.log("End")
        // setCookie("cogUser", JSON.stringify(newSession.cogUser),  { path: '/' })
    }

    const removeSession = () => {
        removeCookie("user", { path: '/' })
        removeCookie("auth", { path: '/' })
        removeCookie("refresh", { path: '/' })
        window.utilInitAuth(null);
        setCogUser(null)
        cacheSessionVar({})
    }

    const refreshUserSession = () => {
        console.log("HERE refreshing: "+session)
        if (session != null) {
            let token = cogGetRefreshToken(session.refresh)
            let tempUser = cogSetupUser(cookies.user.userName)
            tempUser.refreshSession(token, function (err, result) {
                let uAuthorization = {};
                uAuthorization.accessToken = result.getAccessToken().getJwtToken()
                let uRefreshToken = result.refreshToken.token
                uAuthorization.idToken = result.idToken.jwtToken
                const newSession = { user: session.user, auth: uAuthorization, cogUser: tempUser, refresh: uRefreshToken }
                console.log(newSession)
                setSession(newSession);
                cacheSessionVar(newSession)
            })
        }
    }

    useEffect(() => {
        console.log("HERE")
        const newSection = checkSectionURL();
        if (newSection != selectedSection) {
            setSelectedSection(newSection)
        }
        if (session != null) {
            
            let decodedTkn = jwt_decode(cookies.auth.accessToken)
            let currTime = new Date()
            let tempUser = cogSetupUser(cookies.user.userName)
            console.log(decodedTkn.exp*1000)
            console.log(currTime.getTime())
            tempUser.getSession(function (err, cogSession) { 
                if (err || !cogSession.isValid() || decodedTkn.exp*1000 < currTime.getTime() ) { 
                    closeMobileMenu()
                    console.log("Logging out")
                    handleLogout(tempUser)
                } else {
                    console.log("Init auth: "+session.auth.idToken)
                    window.utilInitAuth(session.auth)
                    if (cogUser == null) {
                        console.log(tempUser)
                        setCogUser(tempUser)
                        window.utilInitSession(session.user, tempUser);
                        console.log(session)
                    }
                    setTimeout(refreshUserSession, decodedTkn.exp*1000 - currTime.getTime() - 1000)
                }
            });
        }
    }, []);

    const handleSectionChange = (newValue) => {
        setSelectedSection(newValue);
        updateRoute(newValue);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    function closeUserMenu() {
        setUserMenuAnchor(null);
    }

    function closeMobileMenu() {
        setMobileMenuAnchor(null);
    }

    function handleLogout(user) {
        user.signOut();
        removeSession();
    }

    function handleSearchTermChange(newValue) {
        if (searchTerm !== newValue) {
            setSearchTerm(newValue);
        }
    }

    const isAdmin = session &&
        (session.user.userRole == 'Admin' || session.user.userRole == 'TechAdmin');

    const login = (
        <Dialog open={ session == null }>
            <LoginForm onLogin={ (x) => setSession(x) } />
        </Dialog>
    );

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
            <Button  onClick={() => handleSectionChange(0)} flexshrink={2} minWidth="30px" startIcon={ <People/>  }
                variant={ (selectedSection === 0) ? 'outlined' : 'text' } color="inherit" >
                <Hidden mdDown> Clients </Hidden>
                    </Button>
                    <Button ml= '0' onClick={() => handleSectionChange(1)} minWidth="30px" startIcon={<Face />}
                    disabled={!isAdmin} variant={ (selectedSection === 1) ? 'outlined' : 'text' } color="inherit" flexshrink={1}>
                    <Hidden mdDown> Admin </Hidden>
                    </Button>
                    <Button ml= '0' onClick={() => handleSectionChange(2)} minWidth="30px" startIcon={<Today />}
                        variant={ (selectedSection === 2) ? 'outlined' : 'text' } color="inherit" flexshrink={1} >
                        <Hidden mdDown> Today </Hidden>

                    </Button>
                    <Button ml= '0'  minWidth="30px" startIcon={<AccountCircle />} style={{ textTransform: 'none' }}
                        aria-label="account of current user" aria-controls={menuId} aria-haspopup="true"
                        onClick={ handleUserMenuOpen }
                        color="inherit"
                        variant={ (selectedSection === 3) ? 'outlined' : 'text' } flexshrink={1} >
                        <Hidden mdDown>  {session ? session.user.userName : ''} </Hidden>
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

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu anchorEl={mobileMenuAnchor} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={mobileMenuId} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(mobileMenuAnchor)} onClose={() => { closeMobileMenu(); }}>
            <MenuItem>
                <Button startIcon={<People />}
                    onClick={() => { closeMobileMenu(); handleSectionChange(0); }}>
                    Clients
                </Button>
            </MenuItem>
            <MenuItem >
                <Button startIcon={<Face />} onClick={() => { closeMobileMenu(); handleSectionChange(1); }}
                    disabled={!isAdmin}>
                    Admin
                </Button>
            </MenuItem>
            <MenuItem onClick={() => { closeMobileMenu(); handleSectionChange(2); }}>
                <Button startIcon={<Today />}>
                    Today
                </Button>
            </MenuItem>
            <MenuItem onClick={() => { closeMobileMenu(); handleSectionChange(3); }} >
                <Button startIcon={<AccountCircle />}>
                    Profile
                </Button>
            </MenuItem>
            <MenuItem onClick={() => { closeMobileMenu(); handleLogout(cogUser); }} >
                <Button startIcon={<ExitToApp />}>
                    Logout
                </Button>
            </MenuItem>
        </Menu>
    );

    return (
        <ThemeProvider theme={theme}>
            { login }
            <Box flexGrow={1} >
                <AppBar position="fixed">
                    <Toolbar>
                    <Hidden smDown> <Tooltip title={props.version}>
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

                { renderMobileMenu }
                { renderMenu }
                
                <DbSwitch />
                <SectionsContent searchTerm={ searchTerm } handleSearchTermChange={ handleSearchTermChange } session={ session } />
            </Box>
        </ThemeProvider>
    )
}