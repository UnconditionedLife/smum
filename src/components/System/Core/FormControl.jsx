import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiFormControl from "@mui/material/FormControl";

const FormControlSpacing = styled(MuiFormControl)(spacing);
const FormControl = styled(FormControlSpacing)(sizing);

export default FormControl;