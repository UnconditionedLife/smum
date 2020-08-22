import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import theme from './Theme.jsx';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PeopleIcon from '@material-ui/icons/People';
import FaceIcon from '@material-ui/icons/Face';
import LoginForm from "./LoginForm.jsx";
import ClientsMain from '../Clients/ClientsMain.jsx';
import AdminMain from '../Admin/AdminMain.jsx';
import UserMain from '../User/UserMain.jsx';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    },
  },
  clients:{
    width:'100%',
    position:'relative',
    top:'3.5px',
    fontSize:'15px',
    right:'360px',//used to be 90
    letterSpacing: '2px',

  },
  admin:{
    width:'100%',
    position:'relative',
    top:'3.5px',
    fontSize:'15px',
    // right:'65px',
    right:'180px',
    letterSpacing: '2px',

  },
  username:{
    width:'100%',
    position:'relative',
    top:'3.5px',
    fontSize:'15px',
    right:'40px',
    textTransform:'lowercase',
  },
  logout:{
    width:'100%',
    position:'relative',
    top:'3px',
    fontSize:'15px',
    right:'-30px',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft:20,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    marginLeft: '10px'
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
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

export default function SectionsNavBar(props) {
  const classes = useStyles();
  const [ anchorEl, setAnchorEl ] = useState(null);
  const [ mobileMoreAnchorEl, setMobileMoreAnchorEl ] = useState(null);
  const [ session, setSession ] = useState(null);
  const [ selectedSection, setSelectedSection ] = useState(0);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ typedSearchTerm, setTypedSearchTerm ] = useState('')

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  useEffect(() => {
    ReactDOM.render(<LoginForm onLogin={(x) => setSession(x)}/>,
      document.getElementById("loginOverlay"));
  });

  const handleSectionChange = (newValue) => {
    console.log("IN SECTION CHANGE")
    console.log(newValue)
    setSelectedSection(newValue);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

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
    <div className={classes.search}>
      <div className={classes.searchIcon} >
        <SearchIcon />
      </div>
      <InputBase
        id='searchField'
        placeholder="Search clients"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ 'aria-label': 'search' }}
        value={ typedSearchTerm }
        onChange= { event => { 
          setTypedSearchTerm(event.target.value)
        }}
        onKeyPress={ event => {
          if (event.key == "Enter") { 
            if (selectedSection !== 0) handleSectionChange(0)
            setSearchTerm(typedSearchTerm)
            setTypedSearchTerm('')
          }
        }}
      />
    </div>
    <div className={classes.grow} />
    <div className={classes.sectionDesktop}>

      {/* Calling App.js : () => window.navSwitch('clients') */}
      <Button onClick={() => handleSectionChange(0)} startIcon={<PeopleIcon/>}
        className={classes.clients} variant="text" color="inherit"
      >
        Clients
      </Button>

      {/* Calling App.js : () => window.navSwitch('admin') */}
      <Button onClick={() => handleSectionChange(1)} startIcon={<FaceIcon/>}
        className={classes.admin} disabled={!isAdmin} variant="text" color="inherit">
        Admin
      </Button>

      {/* Calling App.js : () => window.navSwitch('user')
      <Button onClick={() => handleSectionChange(2)} className={classes.username} variant="text" color="inherit" >
        {user ? user.userName : ''}
      </Button>
      <Button onClick={() => handleLogout()} className={classes.logout} color="inherit">
        Logout
      </Button>*/}
      <Button
      edge="end"
      startIcon={<AccountCircle />}
      style={{textTransform: 'none'}}
      aria-label="account of current user"
      aria-controls={menuId}
      aria-haspopup="true"
      onClick={handleProfileMenuOpen}
      color="inherit"
      variant = "text"
      >
      {session ? session.user.userName : ''}
      </Button>

    </div>
    <div className={classes.sectionMobile}>
      <IconButton
        aria-label="show more"
        aria-controls={mobileMenuId}
        aria-haspopup="true"
        onClick={handleMobileMenuOpen}
        color="inherit"
      >
        <MoreIcon />
      </IconButton>
    </div>
    </React.Fragment>
  );

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => window.navSwitch('user')}>
        <Button startIcon={<AccountCircle/>}>Profile</Button>
      </MenuItem>
      <MenuItem onClick={() => handleLogout()} >
        <Button startIcon={<ExitToAppIcon/>}>Logout</Button>
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <Button startIcon={<PeopleIcon/>} onClick={() => handleSectionChange(0)} >
          Clients
        </Button>
      </MenuItem>


      <MenuItem >
        <Button startIcon={<FaceIcon/>} onClick={() => handleSectionChange(1)}
         disabled={!isAdmin}>
        Admin
        </Button>
      </MenuItem>

      <MenuItem onClick={() => window.navSwitch('user')} >
        <Button startIcon={<AccountCircle />}>
        Profile
        </Button>
      </MenuItem>

      <MenuItem onClick={() => handleLogout()} >
        <Button startIcon={<ExitToAppIcon />}>
        Logout
        </Button>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <Tooltip title={props.version}>
          <Typography className={classes.title} variant='h6' noWrap>
            Santa Maria Urban Ministry
          </Typography>
          </Tooltip>
          {session ? appbarControls : null}
        </Toolbar>
      </AppBar>
      { renderMobileMenu }
      { renderMenu }
      <ThemeProvider theme={ theme }>
          {selectedSection === 0 && 
            <ClientsMain 
                searchTerm={ searchTerm }
                handleSearchTermChange = { handleSearchTermChange }
            />}
          {selectedSection === 1 && <AdminMain />}
          {selectedSection === 2 && <UserMain/>}
      </ThemeProvider>
    </div>
  );
};
