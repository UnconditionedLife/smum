import { createTheme } from '@material-ui/core/styles';
import { green, deepOrange } from '@material-ui/core/colors';

const defaultTheme = createTheme();

const theme = createTheme({
    palette: {
        primary: { main: green[600] },
        secondary: { main: deepOrange[900] },
    },
    props: {
        MuiCard: {
            variant: 'elevation',
            elevation: 4,
        },
        MuiTextField: {
            variant: 'outlined',
        },
        MuiSelect: {
            variant: 'outlined',
        },
    },
});

theme.overrides = {
    ...theme.overrides,
    MuiButton: {
        ...theme.MuiButton,
        root: {
            ...theme.root,
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            marginLeft: theme.spacing(1.5),
            marginRight: theme.spacing(1.5),
            minWidth: theme.spacing(12),
        }
    },
    MuiToolbar: {
        ...theme.MuiToolbar,
        gutters: {
            ...theme.gutters,
            [defaultTheme.breakpoints.down('xs')]: {
                paddingLeft: '0px',
                paddingRight: '0px',
            },
        },
    },  
    MuiTableCell: {
        ...theme.MuiTableCell,
        head: {
            ...theme.head,
            border: '1px solid black'
        }
    },  
    MuiCard: {
        ...theme.MuiCard,
        root: {
            ...theme.root,
            margin: theme.spacing(1),
        }
    },
    MuiTableHead: {
        ...theme.MuiTableHead,
        root: {
            ...theme.root,
            backgroundColor: theme.palette.primary.light,
        }
    },
    MuiFormControl: {
        ...theme.MuiFormControl,
        root: {
            ...theme.root,
            margin: theme.spacing(1),
        }
    },
}

export default theme