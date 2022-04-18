import React, { Fragment, useState, useEffect  } from 'react';
import { fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { AppBar, Toolbar, Tooltip, IconButton, Typography, InputBase, MenuItem, Menu, Box } from '@material-ui/core';
import { MoreVert, Search, AccountCircle, ExitToApp, Face, People, Today} from '@material-ui/icons';
import { Button } from '../System';

const useStyles = makeStyles((theme) => ({
    menus: {
        position: 'relative',
        width: '100%',
        [theme.breakpoints.up('lg')]: {
          marginLeft: theme.spacing(3),
          width: 'auto',
        },
    },
    desktop: {
        display: 'none',
        [theme.breakpoints.up('lg')]: {
          display: 'flex',
          justifyContent: 'flex-end',
        },
    },
    mobile: {
        [theme.breakpoints.up('lg')]: {
          display: 'none',
        },
    },
}))

export default function HeaderMenu(props){
    const classes = useStyles();
    const selectedSection = props.selectedSection
    const handleSectionChange = props.handleSectionChange
    const session = props.session
    const [ userMenuAnchor, setUserMenuAnchor ] = useState(null);
    const [ mobileMenuAnchor, setMobileMenuAnchor ] = useState(null);

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    }
    
    const handleMobileMenuOpen = (event) => {
        setMobileMenuAnchor(event.currentTarget);
    }

    function closeUserMenu() {
        setUserMenuAnchor(null);
    }
    
    function closeMobileMenu() {
        setMobileMenuAnchor(null);
    }

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
        <Box className={classes.menus} mr={2} ml={2.5} justifyContent="flex-end" flexGrow={1}>
            <Box className={classes.desktop}>
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
            <Box justifyContent="flex-end" display="flex" className={classes.mobile}>
                <IconButton aria-label="show more" aria-controls={ mobileMenuId } aria-haspopup="true"
                    onClick={ handleMobileMenuOpen } color="inherit">
                    <MoreVert />
                </IconButton>
            </Box>
        </Box >
    )
}