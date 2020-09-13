import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiCard from "@material-ui/core/Card";

const CardSpacing = styled(MuiCard)(spacing);
const Card = styled(CardSpacing)(sizing);

export default Card;