import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiFab from "@mui/material/Fab";

const FabSpacing = styled(MuiFab)(spacing);
const Fab = styled(FabSpacing)(sizing);

export default Fab;