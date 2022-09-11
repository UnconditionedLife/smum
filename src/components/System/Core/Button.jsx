import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiButton from "@mui/material/Button";

const ButtonSpacing = styled(MuiButton)(spacing);
const Button = styled(ButtonSpacing)(sizing);

export default Button;