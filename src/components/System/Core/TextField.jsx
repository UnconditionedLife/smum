import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiTextField from "@mui/material/TextField";

const TextFieldSpacing = styled(MuiTextField)(spacing);
const TextField = styled(TextFieldSpacing)(sizing);

export default TextField;