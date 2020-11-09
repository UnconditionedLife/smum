import { styled } from "@material-ui/core/styles";
import { spacing, sizing, palette } from "@material-ui/system";
import MuiCard from "@material-ui/core/Card";

const CardSpacing = styled(MuiCard)(spacing);
const CardStyled = styled(CardSpacing)(sizing);
const Card = styled(CardStyled)(palette);

export default Card;