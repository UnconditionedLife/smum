import { createTheme } from '@mui/material/styles';
import { green } from '@mui/material/colors';

let theme = createTheme({
    palette: {
        primary: { main: green[600] },
        // '#7ab856' when the color gets this light the text switches to dark
        // green[600]
        
        secondary: { main: '#4f1512' },
        // deepOrange[900]
        // '#4f1512'
    },
})

theme = createTheme(theme, {
    components: {
        MuiButton: {
            styleOverrides:{
                root: {
                    marginTop: theme.spacing(1),
                    marginBottom: theme.spacing(1),
                    marginLeft: theme.spacing(1),
                    marginRight: theme.spacing(1),
                    minWidth: theme.spacing(12),
                }
            }
        },
        MuiCard: {
            styleOverrides:{
                root: {
                    margin: theme.spacing(1),
                    variant: 'elevation',
                    elevation: theme.spacing(.5),
                }
            },
        },
        MuiFormControl: {
            styleOverrides:{
                root: {
                    margin: theme.spacing(1),
                }
            }
        },
        MuiTableCell: {
            styleOverrides:{
                head: {
                    border: '1px solid black'
                }
            }
        },
        MuiTableHead: {
            styleOverrides:{
                root: {
                    backgroundColor: theme.palette.primary.light,
                }
            }
        },
        MuiToolbar: {
            styleOverrides:{
                gutters: {
                    [theme.breakpoints.down('sm')]: {
                        paddingLeft: '0px',
                        paddingRight: '0px',
                    },
                }
            }
        },
    }
})

export default theme