import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiIconButton from "@mui/material/IconButton";

const IconButtonSpacing = styled(MuiIconButton)(spacing);
const IconButton = styled(IconButtonSpacing)(sizing);

export default IconButton;