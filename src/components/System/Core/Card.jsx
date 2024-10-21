import { styled } from "@mui/material/styles";
import { spacing, sizing, palette } from "@mui/system";
import MuiCard from "@mui/material/Card";

const CardSpacing = styled(MuiCard)(spacing);
const CardStyled = styled(CardSpacing)(sizing);
const Card = styled(CardStyled)(palette);

export default Card;