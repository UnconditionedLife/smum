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
        background: { default: '#f4f6f5', paper: '#ffffff' },
        text: { primary: '#1c2421', secondary: '#5f6b66' },
        divider: 'rgba(28, 36, 33, 0.10)',
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        // One compact scale so headings on different pages stay close in size
        h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
        h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' },
        h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.015em' },
        h4: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
        h5: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.01em' },
        h6: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.005em' },
        subtitle1: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
        body2: { fontSize: '0.875rem', lineHeight: 1.5 },
        caption: { fontSize: '0.75rem', lineHeight: 1.45 },
        button: { fontSize: '0.875rem', textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
        overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em' },
    },
})

// Panels sit flat on the white section sheet; only floating surfaces get shadows
const raisedShadow = '0 8px 24px rgba(16, 24, 40, 0.12)';

let theme = createTheme(base, {
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: base.palette.background.default,
                    overflowX: 'clip',
                },
                // FullCalendar (Admin > Calendar) in the app's style
                '.fc': {
                    '--fc-border-color': base.palette.divider,
                    '--fc-today-bg-color': alpha(PRIMARY, 0.08),
                    '--fc-button-bg-color': PRIMARY,
                    '--fc-button-border-color': PRIMARY,
                    '--fc-button-hover-bg-color': green[700],
                    '--fc-button-hover-border-color': green[700],
                    '--fc-button-active-bg-color': green[800],
                    '--fc-button-active-border-color': green[800],
                    fontFamily: base.typography.fontFamily,
                },
                '.fc .fc-toolbar-title': {
                    fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.01em',
                    [base.breakpoints.down('sm')]: { fontSize: '1.1rem' },
                },
                '.fc .fc-button': {
                    borderRadius: 8, textTransform: 'capitalize', fontWeight: 600, boxShadow: 'none !important',
                    padding: '6px 14px',
                },
                '.fc .fc-button-primary:disabled': {
                    backgroundColor: 'transparent !important', borderColor: `${base.palette.divider} !important`,
                    color: `${base.palette.text.secondary} !important`, opacity: '1 !important',
                },
                '.fc .fc-daygrid-day-top': { flexDirection: 'row !important' },
                '.fc .fc-toolbar.fc-header-toolbar': { marginBottom: base.spacing(2) },
                '.fc .fc-scrollgrid': { borderRadius: 12, overflow: 'hidden', backgroundColor: base.palette.background.paper },
                '.fc .fc-col-header-cell': {
                    backgroundColor: alpha(PRIMARY, 0.08), color: base.palette.primary.dark,
                    fontWeight: 600, padding: '8px 0',
                },
                '.fc .fc-daygrid-day-number': { color: base.palette.text.secondary, fontWeight: 600, padding: '6px 8px' },
                '.fc .fc-day-today .fc-daygrid-day-number': {
                    color: '#fff', backgroundColor: PRIMARY, borderRadius: 999, minWidth: 26, textAlign: 'center',
                    margin: 4, padding: '2px 6px',
                },
                '.fc .fc-daygrid-event': {
                    borderRadius: 6, border: 'none', padding: '2px 6px', fontWeight: 600, fontSize: '0.78rem',
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.12)',
                },
                '.fc .fc-daygrid-day:hover': { backgroundColor: alpha(PRIMARY, 0.04), cursor: 'pointer' },
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
                    boxShadow: 'none',
                }
            },
        },
        // Card titles look like the panel header bars used elsewhere
        MuiCardHeader: {
            defaultProps: { slotProps: { title: { variant: 'h6' } } },
            styleOverrides: {
                root: {
                    padding: base.spacing(1.75, 2.5),
                    borderBottom: `1px solid ${base.palette.divider}`,
                    marginBottom: base.spacing(1),
                },
            }
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
                root: { fontWeight: 600, fontSize: '1.0625rem' },
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
                    boxShadow: 'none',
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
                    // Same green, with a gentle left-to-right sheen
                    backgroundImage: `linear-gradient(90deg, ${green[700]} 0%, ${PRIMARY} 55%, ${green[500]} 100%)`,
                    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.08), 0 4px 16px rgba(46, 125, 50, 0.25)',
                },
                // Sub-navigation bars are a full-width white strip attached under the header
                colorDefault: {
                    backgroundColor: base.palette.background.paper,
                    borderBottom: `1px solid ${base.palette.divider}`,
                    boxShadow: 'none',
                    // !important: the tab bars set an inline width of 100%
                    width: '100vw !important',
                    marginLeft: 'calc(50% - 50vw)',
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
