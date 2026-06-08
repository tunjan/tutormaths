import * as React from "react";
import { Select } from "@base-ui/react/select";

export default function Test() {
  return (
    <Select.Root value="1">
      <Select.Trigger>
        <Select.Value placeholder="Placeholder">
          Custom Child
        </Select.Value>
      </Select.Trigger>
    </Select.Root>
  );
}
