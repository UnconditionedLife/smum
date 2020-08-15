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
import SectionsHeader from './SectionsHeader.jsx';
import LoginForm from "./LoginForm.jsx";
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PeopleIcon from '@material-ui/icons/People';
import FaceIcon from '@material-ui/icons/Face';

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
  const [ user, setUser ] = useState(null);
  const [ selectedSection, setSelectedSection ] = useState(0);
  const [ client, setClient ] = useState({});
  const [ clientData, setClientData ] = useState([]);
  const [ searchState, setSearchState ] = useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  useEffect(() => {
    ReactDOM.render(<LoginForm onLogin={(newUser) => setUser(newUser)}/>, document.getElementById("loginOverlay"));
  });

  const handleClientChange = (newValue) => {
    console.log("IN CLIENT CHANGE")
    console.log(newValue)
    setClient(newValue);
  };

  const handleClientDataChange = (newValue) => {
    console.log("IN CLIENTDATA CHANGE")
    console.log(newValue)
    setClientData(newValue);
    window.clientData = newValue
    if (newValue.length === 1) {
      const newClient = newValue[0]
      handleClientChange(newClient)
    }
  };

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
    window.cogLogoutUser();
    setUser(null);
  };

  function handleSearchState(state) {
    if (searchState !== 'search') {
      setSearchState(state);
    }
  };

  function startSearch() {
    handleSearchState('search')
    const str = document.getElementById('searchField').value
    if (str === '')	return
    if (window.stateCheckPendingEdit()) return
    window.clientData = {}
    handleClientDataChange({})
    const regex = /[/.]/g
    const slashCount = (str.match(regex) || []).length
    let clientDataTemp = window.dbSearchClients(str, slashCount)
    window.uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
    if (clientDataTemp==null||clientDataTemp.length==0){
      window.servicesRendered = []
      window.uiClearCurrentClient()
    } else {
      let columns = ["clientId","givenName","familyName","dob","street"]
      window.uiGenSelectHTMLTable('#FoundClientsContainer', clientDataTemp, columns,'clientTable')
      window.uiResetNotesTab()
      if (clientDataTemp.length === 1) {
        window.client = clientDataTemp[0]
      }
    };
    if (selectedSection !== 0) handleSectionChange(0)
    let clientTemp = window.client // TODO WILL NEED TO GRAB FROM PROPS
    // const clientDataTemp = window.clientData // TODO WILL NEED TO  GRAB FROM COMPONENT
    console.log("Before Datasetting")
    if (clientTemp == undefined || clientTemp == null) {
      clientTemp = {}
    }
    if (clientDataTemp == undefined || clientDataTemp == null) {
      clientDataTemp = []
    }
    console.log(clientDataTemp)
    handleClientChange(clientTemp)
    handleClientDataChange(clientDataTemp)
    window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
  };

  const isAdmin = user && (user.userRole == 'Admin' || user.userRole == 'TechAdmin');

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
        onKeyDown={event => {
          if (event.key == "Enter")
            startSearch()
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
      {user ? user.userName : ''}
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
          {user ? appbarControls : null}
        </Toolbar>
      </AppBar>
      { renderMobileMenu }
      { renderMenu }
      <ThemeProvider theme={ theme }>
        <SectionsHeader 
          section={ selectedSection } 
          client={ client } 
          clientData={ clientData } 
          searchState={ searchState }
        />
      </ThemeProvider>
    </div>
  );
};