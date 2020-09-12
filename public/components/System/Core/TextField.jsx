import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiTextField from "@material-ui/core/TextField";

const TextFieldSpacing = styled(MuiTextField)(spacing);
const TextField = styled(TextFieldSpacing)(sizing);

export default TextField;