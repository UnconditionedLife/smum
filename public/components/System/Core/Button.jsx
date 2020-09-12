import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiButton from "@material-ui/core/Button";

const ButtonSpacing = styled(MuiButton)(spacing);
const Button = styled(ButtonSpacing)(sizing);

export default Button;