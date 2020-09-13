import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiIconButton from "@material-ui/core/IconButton";

const IconButtonSpacing = styled(MuiIconButton)(spacing);
const IconButton = styled(IconButtonSpacing)(sizing);

export default IconButton;