import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiFab from "@material-ui/core/Fab";

const FabSpacing = styled(MuiFab)(spacing);
const Fab = styled(FabSpacing)(sizing);

export default Fab;