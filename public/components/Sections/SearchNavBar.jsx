import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Tooltip, IconButton, Typography, InputBase, MenuItem, Menu, Box } from '@material-ui/core';
import { MoreVert, Search, AccountCircle, ExitToApp, Face, People, Today} from '@material-ui/icons';
import { Button } from '../System';
import theme from './Theme.jsx';
import LoginForm from "./LoginForm.jsx";
import ClientsMain from '../Clients/ClientsMain.jsx';
import AdminMain from '../Admin/AdminMain.jsx';
import UserMain from '../User/UserMain.jsx';
import PageToday from '../Sections/PageToday.jsx';

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
    width: '300px',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  },
  sectionMobile: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

export default function SectionsNavBar(props) {
  const classes = useStyles();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedSection, setSelectedSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typedSearchTerm, setTypedSearchTerm] = useState('')

  useEffect(() => {
    ReactDOM.render(<ThemeProvider theme={theme}>
      <LoginForm onLogin={(x) => setSession(x)} />
    </ThemeProvider>,
      document.getElementById("loginOverlay"));
  });

  const handleSectionChange = (newValue) => {
    console.log("IN SECTION CHANGE")
    console.log(newValue)
    setSelectedSection(newValue);
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
    setSession(null);
  };

  function handleSearchTermChange(newValue) {
    if (searchTerm !== newValue) {
      setSearchTerm(newValue);
    }
  };

  const isAdmin = session &&
    (session.user.userRole == 'Admin' || session.user.userRole == 'TechAdmin');

  const appbarControls = (
    <React.Fragment>

      <Box className={classes.search} mr={2} ml={2.5} flexGrow={1}>
        <Box position="absolute" alignItems='center' pointerEvents='none' display='flex' pl={1} pt={0.75}>
          <Search />
        </Box>
        <InputBase
          id='searchField'
          placeholder="Search clients"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
          value={typedSearchTerm}
          onChange={event => {
            setTypedSearchTerm(event.target.value)
          }}
          onKeyPress={event => {
            if (event.key == "Enter") {
              if (selectedSection !== 0) handleSectionChange(0)
              setSearchTerm(typedSearchTerm)
              setTypedSearchTerm('')
            }
          }}
        />
      </Box>

      <Box className={classes.bar} mr={2} ml={2.5} justifyContent="flex-end" flexGrow={1}>
        <Box className={classes.sectionDesktop}>
          {/* Calling App.js : () => window.navSwitch('clients') */}
          <Button onClick={() => handleSectionChange(0)} startIcon={<People />}
            variant="text" color="inherit"
          >
            Clients
        </Button>

          {/* Calling App.js : () => window.navSwitch('admin') */}
          <Button onClick={() => handleSectionChange(1)} startIcon={<Face />}
            disabled={!isAdmin} variant="text" color="inherit">
            Admin
        </Button>

          <Button onClick={() => handleSectionChange(2)} startIcon={<Today />}
            disabled={!isAdmin} variant="text" color="inherit">
            Today
        </Button>

          <Button
            edge="end"
            startIcon={<AccountCircle />}
            style={{ textTransform: 'none' }}
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
            variant="text"
          >
            {session ? session.user.userName : ''}
          </Button>
        </Box>


        <Box justifyContent="flex-end" display="flex" className={classes.sectionMobile}>
          <IconButton
            aria-label="show more"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Box >
    </React.Fragment >
  );

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={userMenuAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(userMenuAnchor)}
      onClose={() => { closeUserMenu(); }}
    >
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
    <Menu
      anchorEl={mobileMenuAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(mobileMenuAnchor)}
      onClose={() => { closeMobileMenu(); }}

    >
      <MenuItem>
        <Button startIcon={<People />} onClick={() => { closeMobileMenu(); handleSectionChange(0); }} >
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
            <Typography className={classes.title} variant='h6' noWrap>
              Santa Maria Urban Ministry
          </Typography>
          </Tooltip>
          {session ? appbarControls : null}
        </Toolbar>
      </AppBar>
      { renderMobileMenu}
      { renderMenu}
      <ThemeProvider theme={theme}>
        {selectedSection === 0 &&
          <ClientsMain
            searchTerm={searchTerm}
            handleSearchTermChange={handleSearchTermChange}
            session={session}
          />}
        {selectedSection === 1 && <AdminMain session={session} />}
        {selectedSection === 2 && <PageToday session={session} />}
        {selectedSection === 3 && <UserMain session={session} />}
      </ThemeProvider>
    </Box>
  );
};