import React, { useState, useEffect, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { AppBar, Box, Dialog, Toolbar, Tooltip, Typography, InputBase, MenuItem, Menu  } from '@mui/material';
import { Search, AccountCircle, ExitToApp, Settings, People, Today} from '@mui/icons-material';
import { Button } from '../System';
import { LoginForm, SectionsContent }  from '.';
import DbSwitch from './DbSwitch.jsx';
import { useCookies } from 'react-cookie';
import { cogSetupUser } from '../System/js/Cognito.js';
import { jwtDecode } from "jwt-decode";
import SmumLogo from "../Assets/SmumLogo";
import { HeaderDateTime } from '../Clients'
import { cacheSessionVar, clearCache, initCache, showCache, getSession, getAppVersion,
    getUserName, isAdmin, navigationAllowed, setEditingState, dbSetUrl  } from '../System/js/Database';
import UseWindowSize from '../System/Hooks/UseWindowSize.jsx'

const styles = {
    appName: (theme) => ({
        display: 'none',
        [theme.breakpoints.up('lg')]: { display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', flexwrap: 'wrap' },
    }),
    title: (theme) => ({
        display: 'none',
        [theme.breakpoints.up('sm')]: { display: 'block', fontSize: '10px' },
        [theme.breakpoints.up('md')]: { display: 'block', fontSize: '15px' },
        [theme.breakpoints.up('lg')]: { display: 'block', fontSize: '20px' },
    }),
    search: (theme) => ({
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        [theme.breakpoints.down('md')]: {
            marginLeft: theme.spacing(3),
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            minWidth:'170px',
        },
    }),
    input: (theme) => ({
        color: 'inherit',
        width: '100%',
        paddingRight: theme.spacing(1),
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 0, 1, 1),
            // vertical padding + font size from searchIcon
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.down(425)]: {
                maxWidth: "15ch",
            },
            [theme.breakpoints.up('sm')]: {
                paddingLeft: theme.spacing(1),
            },
            [theme.breakpoints.up('md')]: {
                paddingLeft: theme.spacing(2),
            },
            [theme.breakpoints.up('lg')]: {
                paddingLeft: theme.spacing(2),
            },
        },
    }),
    buttonContainer: (theme) => ({
        [theme.breakpoints.down('sm')]: {
            marginRight: theme.spacing(0.5),
            marginLeft: theme.spacing(0.5),
        },
    }),
    icon: (theme) => ({
        [theme.breakpoints.down('md')]: {
            marginRight: theme.spacing(-1),
        },
    }),
    navButton: (active) => ({
        color: 'common.white',
        borderRadius: 999,
        px: { xs: 0.75, md: 1.75 },
        minWidth: 0,
        '& .MuiButton-startIcon': { mr: { xs: 0, md: 1 } },
        bgcolor: active ? 'rgba(255, 255, 255, 0.20)' : 'transparent',
        '&:hover': { bgcolor: active ? 'rgba(255, 255, 255, 0.26)' : 'rgba(255, 255, 255, 0.12)' },
        '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.45)' },
    }),
    // Replaces <Hidden mdDown> / <Hidden smDown>
    hideBelowMd: { display: { xs: 'none', md: 'inline' } },
    hideBelowSm: { display: { xs: 'none', sm: 'block' } },
};

HeaderBar.propTypes = {
    checkSectionURL: PropTypes.func.isRequired,
    updateRoute: PropTypes.func.isRequired,
    handleLogoutRoute: PropTypes.func.isRequired,
}

function tokenTimeRemaining(token) {
    let decodedTkn = jwtDecode(token)
    return decodedTkn.exp*1000 - new Date().getTime() - 30000;
}

export default function HeaderBar(props) {
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [selectedSection, setSelectedSection] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');

    const { checkSectionURL , updateRoute, handleLogoutRoute } = props;

    const [cookies, setCookie, removeCookie] = useCookies(['user','auth','refresh']); // XXX combine in single cookie
    const appVersion = getAppVersion();

    const inputRef = useRef(null)

    // used to make the "/" key move focus to the search field
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (document.activeElement.tagName !== 'INPUT' 
                && document.activeElement.tagName !== 'TEXTAREA'
                && event.key === '/') { //ignore event if in text field and non "/"
                
                event.preventDefault();
                inputRef.current.focus();
            }
        }
    
        // Add event listener to window
        window.addEventListener('keydown', handleKeyDown);
        
        // Remove event listener on cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [])
    
    function sessionFromCookies(cookies) {
        if (cookies && cookies.user && cookies.auth && cookies.refresh) {
            console.log('Creating session from cookies')
            return { user:cookies.user, auth:cookies.auth, refresh:cookies.refresh };
        }
        else {
            console.log('No cookies found')
            return null;
        }
    }

    function setSession(newSession, reInit=false) {
        if (newSession) {
            // Update Local and Global Session vars
            cacheSessionVar(newSession);
            
            setCookie("user", JSON.stringify(newSession.user),  { path: '/' });
            setCookie("auth", JSON.stringify(newSession.auth),  { path: '/' });
            setCookie("refresh", JSON.stringify(newSession.refresh),  { path: '/' });
            // let refreshTime = tokenTimeRemaining(newSession.auth.idToken);
            // setTimeout(refreshUserSession, refreshTime);
            if (reInit) 
                initCache();
        } else {
            removeCookie("user", { path: '/' });
            removeCookie("auth", { path: '/' });
            removeCookie("refresh", { path: '/' });
            clearCache();
        }
    }

    useEffect(() => {
        const newSection = checkSectionURL();
        if (newSection >= 0 && newSection !== selectedSection) {
            setSelectedSection(newSection)
        }
    });

    useEffect(() => {
        console.log("App Start:" )
        dbSetUrl(process.env.dbSetUrl) // environment variable coming from webpack configuration
        if (!getSession()) {
            // Page reload or direct URL access: Check for cookies from previous login.
            let savedSession = sessionFromCookies(cookies);
            if (savedSession && tokenTimeRemaining(savedSession.auth.idToken) > 0) {
                let newCogUser = cogSetupUser(cookies.user.userName);
                newCogUser.getSession(function (err, cogSession) { 
                    if (!err && cogSession.isValid()) { 
                        setSession(savedSession, true);
                    }
                });
            }
        }
    }, []);

    useEffect(() => {
        console.log('Hot Reload');
        showCache();
    }, ["hot"]);

    function handleSectionChange(newValue) {
        if (navigationAllowed()) {
            setSelectedSection(newValue);
            updateRoute(newValue);
        }
    }

    function handleSectionChangeLogout() {
        setSelectedSection(0);
        handleLogoutRoute();
    }

    function handleUserMenuOpen(event) {
        setUserMenuAnchor(event.currentTarget);
    }

    function closeUserMenu() {
        setUserMenuAnchor(null);
    }

    function handleLogout() {
        let myCogUser = cogSetupUser(getUserName());
        setEditingState(false);
        handleSectionChangeLogout();
        handleSearchTermChange('');
        myCogUser.signOut();
        setSession(null, false);
    }

    const handleFocus = (event) => {
        event.target.select();
    }

    function handleSearchTermChange(newValue) {
        if (navigationAllowed()) {
            if (searchTerm !== newValue) {
                setSearchTerm(newValue);
            }
        }
    }

    const notMobile = UseWindowSize().width > 500

    const userName = getUserName();

    const menuId = 'primary-search-account-menu';

    const appbarControls = (
        <Fragment>
            <Box
                sx={[{
                    display: 'flex',
                    mr: 2,
                    ml: 2.5,
                    flexGrow: 1.5,
                    justifyContent: "flex-start"
                }, styles.search]}>
                <Box
                    pointerEvents='none'
                    sx={{
                        alignItems: 'flex-start',
                        display: 'flex',
                        pl: 1,
                        pt: 0.75
                    }}>
                    <Search />
                </Box>
                <InputBase id='searchField' placeholder="Search clients"
                    sx={styles.input}
                    inputRef={ inputRef }
                    type="text"
                    inputProps={{ 'aria-label': 'search' }}
                    onFocus={handleFocus}
                    autoComplete="off"
                    onKeyDown={event => {
                        if (event.key == "Enter") {
                            if (selectedSection !== 0) handleSectionChange(0)
                            handleSearchTermChange(event.target.value)
                        }
                    }}
                />
            </Box>
            <Box sx={{
                justifyContent: "flex-end"
            }}>
                <Button sx={[styles.buttonContainer, styles.navButton(selectedSection === 0)]} onClick={() => handleSectionChange(0)} startIcon={ <People sx={styles.icon} />  }
                    variant='text' color="inherit" style={{ minWidth:"30px" }}>
                    {/* flexShrink={2} */}
                    <Box component="span" sx={styles.hideBelowMd}> Clients </Box>
                </Button>
                    
                <Button sx={[styles.buttonContainer, styles.navButton(selectedSection === 2)]} ml= '0' onClick={() => handleSectionChange(2)} startIcon={<Today sx={styles.icon}/>}
                    variant='text' color="inherit" style={{ minWidth:"30px" }} >
                        {/* flexShrink={1} */}
                    <Box component="span" sx={styles.hideBelowMd}> Today </Box>
                </Button>

                <Button sx={[styles.buttonContainer, styles.navButton(selectedSection === 1)]} ml= '0' onClick={() => handleSectionChange(1)} startIcon={<Settings sx={styles.icon}/>}
                    disabled={!isAdmin()} variant='text' color="inherit" style={{ minWidth:"30px" }} >
                        {/* flexShrink={1} */}
                    <Box component="span" sx={styles.hideBelowMd}> Admin </Box>
                </Button>

                <Button sx={[styles.buttonContainer, styles.navButton(selectedSection === 3)]} ml= '0' startIcon={<AccountCircle sx={styles.icon}/>} 
                    style={{ textTransform: 'none', minWidth:"30px" }}
                    aria-label="account of current user" aria-controls={menuId} aria-haspopup="true"
                    onClick={ handleUserMenuOpen }
                    color="inherit"
                    variant='text' >
                        {/* flexShrink={1} */}
                    <Box component="span" sx={styles.hideBelowMd}>  { userName ? userName : ''} </Box>
                </Button>
            </Box>
        </Fragment >
    );

    const renderMenu = (
        <Menu anchorEl={userMenuAnchor} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(userMenuAnchor)} onClose={() => { closeUserMenu(); }}>
            <MenuItem onClick={() => { closeUserMenu(); handleSectionChange(3); }}>
                <Button startIcon={<AccountCircle />}>Profile</Button>
            </MenuItem>
            <MenuItem onClick={() => { closeUserMenu(); handleLogout(); }} >
                <Button startIcon={<ExitToApp />}>Logout</Button>
            </MenuItem>
        </Menu>
    );

    return (
        <>
                {!(userName) && <Dialog open={true} style={{ margin:0, width:'100%' }}>
                    <LoginForm onLogin={ (x) => setSession(x, true) } />
                </Dialog>}
                <Box sx={{
                    flexGrow: 1
                }} >
                    <AppBar position="fixed">
                        <Toolbar>
                            <Box sx={styles.hideBelowSm}>
                                <Tooltip title={ appVersion }>
                                    <Box
                                        sx={{
                                            width: '50px',
                                            height: '50px',
                                            bgcolor: "#fff",
                                            mr: 2,
                                            p: '3px',
                                            borderRadius: '25px'
                                        }}>
                                        <SmumLogo width='44px' height='44px' display="solid" /> 
                                    </Box>
                                </Tooltip>
                            </Box>
                            <Box
                                sx={[{
                                    mr: 4,
                                    mt: 1
                                }, styles.appName]}>
                                <Typography variant='h6' noWrap sx={ styles.title } >
                                    Santa Maria Urban Ministry
                                </Typography>
                                <HeaderDateTime color='inherit' size='overline' />
                            </Box>
                            {userName ? appbarControls : null}
                        </Toolbar>
                    </AppBar>
                    { renderMenu }
                    {/* environment variable coming from webpack configuration */}
                    {/* removed from screens smaller than 500 px */}
                    { (process.env.dbSetUrl === "dev" && notMobile ) && <DbSwitch /> } 
                    <SectionsContent searchTerm={ searchTerm } handleSearchTermChange={ handleSearchTermChange } />
                </Box>
        </>
    );
}