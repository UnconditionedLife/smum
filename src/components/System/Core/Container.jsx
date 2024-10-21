import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiContainer from "@mui/material/Container";

const ContainerSpacing = styled(MuiContainer)(spacing);
const Container = styled(ContainerSpacing)(sizing);

export default Container;