import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Tooltip, IconButton, Typography, InputBase, MenuItem, Menu, Box } from '@material-ui/core';
import { MoreVert, Search, AccountCircle, ExitToApp, Face, People, Today} from '@material-ui/icons';
import { Button } from '../System';
import { LoginForm, SectionsContent }  from '.';
import theme from '../Theme.jsx';
import DbSwitch from './DbSwitch.jsx';
import { useCookies } from 'react-cookie';
import { cogSetupUser, cogSetupSession } from '../System/js/Cognito.js';
import SmumLogo from "../Assets/SmumLogo";

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      fontSize: '20px',
    },
    [theme.breakpoints.up('lg')]: {

    },
  },
  bar: {
    position: 'relative',
    flexShrink: 3,
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  search: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
    },
  },
  inputRoot: {
    color: 'inherit',
    width: '200px',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
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
  appName: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  },
  sectionMobile: {
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
  },
}));

export default function HeaderBar(props) {
    const classes = useStyles();
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const [cogUser, setCogUser] = useState(null);
    const [selectedSection, setSelectedSection] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');

    const checkSectionURL = props.checkSectionURL;
    const updateRoute = props.updateRoute;
    const [cookies, setCookie, removeCookie] = useCookies(['user','auth']);
    const session = cookies.user && cookies.auth ? 
          {user:cookies.user,auth:cookies.auth, cogUser: cogUser} : null;
  
    const setSession = (newSession) => {
        if (newSession.user != null && newSession.auth != null) {
            setCookie("user", JSON.stringify(newSession.user),  { path: '/' })
            setCookie("auth", JSON.stringify(newSession.auth),  { path: '/' })
            setCogUser(newSession.cogUser)
        } else {
            removeSession()
        }
        // setCookie("cogUser", JSON.stringify(newSession.cogUser),  { path: '/' })
    }

    const removeSession = () => {
        removeCookie("user", { path: '/' })
        removeCookie("auth", { path: '/' })
        setCogUser(null)
        // removeCookie("cogUser")
    }

    useEffect(() => {
        const newSection = checkSectionURL(selectedSection);
        if (newSection != -1) {
            setSelectedSection(newSection)
        }
        if (session != null) {
            let tempUser = cogSetupUser(cookies.user.userName)
            tempUser.getSession(function (err, cogSession) { 
                if (err || !cogSession.isValid()) {
                    removeSession()
                } else {
                    if (cogUser == null) {
                        setCogUser(tempUser)
                    }
                    window.utilInitAuth(cookies.auth)
                    window.utilInitSession(cookies.user, tempUser);
                    window.uiShowHideLogin('hide');
                }
            });
        } else {
            ReactDOM.render(
                <ThemeProvider theme={theme}>
                    <LoginForm onLogin={(x) => setSession(x)} />
                </ThemeProvider>,
                document.getElementById("loginOverlay"));
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

    function handleLogout() {
        session.cogUser.signOut();
        window.uiShowHideLogin('show');
        window.utilInitAuth(null);
        removeSession();
        ReactDOM.render(<ThemeProvider theme={theme}>
        <LoginForm onLogin={(x) => setSession(x)} />
        </ThemeProvider>,
        document.getElementById("loginOverlay"));
    }

    function handleSearchTermChange(newValue) {
        if (searchTerm !== newValue) {
        setSearchTerm(newValue);
        }
    }

    const isAdmin = session &&
        (session.user.userRole == 'Admin' || session.user.userRole == 'TechAdmin');

    const appbarControls = (
        <React.Fragment>
            <Box display='flex' className={classes.search} mr={2} ml={2.5} flexGrow={1} justifyContent="flex-start">
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
            <Box className={classes.bar} mr={2} ml={2.5} justifyContent="flex-end" flexGrow={1}>
                <Box className={classes.sectionDesktop}>
                    <Button mr='0' onClick={() => handleSectionChange(0)} startIcon={ <People /> }
                        variant={ (selectedSection === 0) ? 'outlined' : 'text' } color="inherit">
                        Clients
                    </Button>
                    <Button mr= '0' onClick={() => handleSectionChange(1)} startIcon={<Face />}
                        disabled={!isAdmin} variant={ (selectedSection === 1) ? 'outlined' : 'text' } color="inherit">
                        Admin
                    </Button>
                    <Button mr= '0' onClick={() => handleSectionChange(2)} startIcon={<Today />}
                        variant={ (selectedSection === 2) ? 'outlined' : 'text' } color="inherit">
                        Today
                    </Button>
                    <Button mr= '0' edge="end" startIcon={<AccountCircle />} style={{ textTransform: 'none' }}
                        aria-label="account of current user" aria-controls={menuId} aria-haspopup="true"
                        onClick={ handleUserMenuOpen }
                        color="inherit"
                        variant={ (selectedSection === 3) ? 'outlined' : 'text' }>
                        {session ? session.user.userName : ''}
                    </Button>
                </Box>
                <Box justifyContent="flex-end" display="flex" className={classes.sectionMobile}>
                    <IconButton aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true"
                        onClick={handleMobileMenuOpen} color="inherit">
                        <MoreVert />
                    </IconButton>
                </Box>
            </Box >
        </React.Fragment >
    );

    const menuId = 'primary-search-account-menu';
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

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu anchorEl={mobileMenuAnchor} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={mobileMenuId} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(mobileMenuAnchor)} onClose={() => { closeMobileMenu(); }}>
            <MenuItem>
                <Button startIcon={<People />}
                    onClick={() => { closeMobileMenu(); handleSectionChange(0); }}>
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
            <MenuItem onClick={() => { closeMobileMenu(); handleLogout(); }} >
                <Button startIcon={<ExitToApp />}>
                    Logout
                </Button>
            </MenuItem>
        </Menu>
    );

    return (
        <Box flexGrow={1} >
            <AppBar position="fixed">
                <Toolbar>
                    <Tooltip title={props.version}>
                        <Box width='50px' height='50px' bgcolor="#fff" mr={ 2 } p='3px' borderRadius='25px'>
                            <SmumLogo width='44px' height='44px'/>
                        </Box>
                    </Tooltip>
                    <Box mr={ 4 } className={ classes.appName }>
                        <Tooltip title={props.version}>
                            <Typography className={classes.title} variant='h6' noWrap>
                                Santa Maria Urban Ministry
                            </Typography>
                        </Tooltip>
                    </Box>
                    {session ? appbarControls : null}
                </Toolbar>
            </AppBar>
            { renderMobileMenu }
            { renderMenu }
            <ThemeProvider theme={theme}>
                <DbSwitch />
                <SectionsContent
                    searchTerm={searchTerm}
                    handleSearchTermChange={handleSearchTermChange}
                    session={session}
                />
            </ThemeProvider>
        </Box>
    )
}