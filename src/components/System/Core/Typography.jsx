import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiTypography from "@mui/material/Typography";

const TypographySpacing = styled(MuiTypography)(spacing);
const Typography = styled(TypographySpacing)(sizing);

export default Typography;