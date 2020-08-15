import { createMuiTheme } from '@material-ui/core/styles';
import { green, deepOrange } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: { main: green[600] },
        secondary: { main: deepOrange[900] },
    }
});

export default theme