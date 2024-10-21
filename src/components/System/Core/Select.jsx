import { styled } from "@mui/material/styles";
import { spacing, sizing } from "@mui/system";
import MuiSelect from "@mui/material/Select";

const SelectFieldSpacing = styled(MuiSelect)(spacing);
const Select = styled(SelectFieldSpacing)(sizing);

export default Select;