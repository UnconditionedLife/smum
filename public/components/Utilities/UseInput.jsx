import React, { useState } from "react";

export function useInput(initialValue) {
  let [value, setValue] = useState(initialValue);

  function handleValueChange(e) {
    setValue(e.target.value);
  }

  function reset() {
    setValue(initialValue);
  }

  return {
    value,
    setValue,
    reset,
    bind: {value, onChange: handleValueChange} // HTML input properties
  };
}
