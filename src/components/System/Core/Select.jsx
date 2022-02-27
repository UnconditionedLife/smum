import { styled } from "@material-ui/core/styles";
import { spacing, sizing } from "@material-ui/system";
import MuiSelect from "@material-ui/core/Select";

const SelectFieldSpacing = styled(MuiSelect)(spacing);
const Select = styled(SelectFieldSpacing)(sizing);

export default Select;