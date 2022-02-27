import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiTypography from "@material-ui/core/Typography";

const TypographySpacing = styled(MuiTypography)(spacing);
const Typography = styled(TypographySpacing)(sizing);

export default Typography;