import { createMuiTheme } from '@material-ui/core/styles';
import { palette } from '@material-ui/system';
import { green, deepOrange } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: { main: green[600] },
        secondary: { main: deepOrange[900] },
    },
    overrides: {
        // Name of the component ⚛️
        MuiTableHead: {
          // The default props to change

        }
    }
});

export default theme