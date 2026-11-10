import { createTheme, alpha } from '@mui/material/styles';
import { green } from '@mui/material/colors';

const PRIMARY = green[600];   // '#43a047'
const SECONDARY = '#CC0000';

//****************** APP THEME ********************
//*************************************************

const base = createTheme({
    palette: {
        primary: { main: PRIMARY },
        secondary: { main: SECONDARY },
        background: { default: '#f5f7f5', paper: '#ffffff' },
        text: { primary: '#1c2421', secondary: '#5f6b66' },
        divider: 'rgba(28, 36, 33, 0.10)',
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600, letterSpacing: '-0.01em' },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
        overline: { fontWeight: 600, letterSpacing: '0.06em' },
    },
})

const softShadow = '0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.08)';
const raisedShadow = '0 8px 24px rgba(16, 24, 40, 0.12)';

let theme = createTheme(base, {
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: base.palette.background.default },
            }
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides:{
                root: {
                    marginTop: base.spacing(1),
                    marginBottom: base.spacing(1),
                    marginLeft: base.spacing(1),
                    marginRight: base.spacing(1),
                    minWidth: base.spacing(12),
                    borderRadius: 8,
                    paddingLeft: base.spacing(2),
                    paddingRight: base.spacing(2),
                }
            }
        },
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides:{
                root: {
                    margin: base.spacing(1),
                    borderRadius: 12,
                    border: `1px solid ${base.palette.divider}`,
                    boxShadow: softShadow,
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 16, boxShadow: raisedShadow },
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: { fontWeight: 700, fontSize: '1.15rem' },
            }
        },
        MuiMenu: {
            styleOverrides: {
                paper: { borderRadius: 10, boxShadow: raisedShadow, border: `1px solid ${base.palette.divider}` },
            }
        },
        MuiPopover: {
            styleOverrides: {
                paper: { borderRadius: 12, boxShadow: raisedShadow },
            }
        },
        MuiFormControl: {
            styleOverrides:{
                root: {
                    margin: base.spacing(1),
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: base.palette.background.paper,
                    borderRadius: 8,
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(PRIMARY, 0.6) },
                },
                notchedOutline: { borderColor: 'rgba(28, 36, 33, 0.18)' },
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: { borderRadius: 12 },
            }
        },
        MuiTableHead: {
            styleOverrides:{
                root: {
                    backgroundColor: alpha(PRIMARY, 0.08),
                }
            }
        },
        MuiTableCell: {
            styleOverrides:{
                root: {
                    borderBottom: `1px solid ${base.palette.divider}`,
                },
                head: {
                    fontWeight: 600,
                    color: base.palette.primary.dark,
                    whiteSpace: 'nowrap',
                },
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    'tbody &:hover': { backgroundColor: alpha(PRIMARY, 0.04) },
                    '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: alpha(PRIMARY, 0.12) },
                },
            }
        },
        MuiTabs: {
            styleOverrides: {
                indicator: { height: 3, borderRadius: '3px 3px 0 0' },
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 56,
                    color: base.palette.text.secondary,
                },
            }
        },
        MuiAccordion: {
            defaultProps: { disableGutters: true, elevation: 0 },
            styleOverrides: {
                root: {
                    border: `1px solid ${base.palette.divider}`,
                    borderRadius: 12,
                    boxShadow: softShadow,
                    marginBottom: base.spacing(1.5),
                    '&:before': { display: 'none' },
                    '&:first-of-type, &:last-of-type': { borderRadius: 12 },
                },
            }
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: { minHeight: 56, fontWeight: 600 },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 8 },
            }
        },
        MuiFab: {
            styleOverrides: {
                root: { boxShadow: raisedShadow },
            }
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10 },
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: { borderRadius: 6, fontSize: '0.75rem' },
            }
        },
        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                colorPrimary: {
                    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.08), 0 2px 8px rgba(16, 24, 40, 0.10)',
                },
                colorDefault: {
                    backgroundColor: base.palette.background.paper,
                    borderBottom: `1px solid ${base.palette.divider}`,
                    boxShadow: 'none',
                },
            }
        },
        MuiToolbar: {
            styleOverrides:{
                gutters: {
                    [base.breakpoints.down('sm')]: {
                        paddingLeft: '0px',
                        paddingRight: '0px',
                    },
                }
            }
        },
    }
})

export default theme

//****************** REPORT THEME *****************
//*************************************************
// Printed reports (Today page, Admin > Reports) keep the original look.
// This is the app theme as it was before the redesign; wrap report output
// in <ThemeProvider theme={ reportTheme }> so the new styles don't reach it.

let legacy = createTheme({
    palette: {
        primary: { main: PRIMARY },
        secondary: { main: SECONDARY },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
})

export const reportTheme = createTheme(legacy, {
    components: {
        MuiButton: {
            styleOverrides:{
                root: {
                    marginTop: legacy.spacing(1),
                    marginBottom: legacy.spacing(1),
                    marginLeft: legacy.spacing(1),
                    marginRight: legacy.spacing(1),
                    minWidth: legacy.spacing(12),
                }
            }
        },
        MuiCard: {
            styleOverrides:{
                root: {
                    margin: legacy.spacing(1),
                }
            },
        },
        MuiFormControl: {
            styleOverrides:{
                root: {
                    margin: legacy.spacing(1),
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
                    backgroundColor: legacy.palette.primary.light,
                }
            }
        },
    }
})
