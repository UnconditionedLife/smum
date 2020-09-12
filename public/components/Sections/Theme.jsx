import { createMuiTheme } from '@material-ui/core/styles';
import { green, deepOrange } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: { main: green[600] },
        secondary: { main: deepOrange[900] },
    },
    overrides: {
        MuiButton: {
            root: {
                marginLeft: 12,
                marginRight: 12,
                minWidth: 96,
            }
            
        },
        MuiInput: {
            root: {
                margin: 8,
            }
            
        }

    }
});

theme.overrides = {
    ...theme.overrides,
    MuiTableHead: {
        ...theme.MuiTableHead,
        root: {
            ...theme.root,
            backgroundColor: theme.palette.primary.light,
        }
    }
};

export default theme