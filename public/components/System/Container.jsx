import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiContainer from "@material-ui/core/Container";

const ContainerSpacing = styled(MuiContainer)(spacing);
const Container = styled(ContainerSpacing)(sizing);

export default Container;