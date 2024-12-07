# MAPF Solution Validator

## Install

(Assuming from `/client` or `/server`)

```bash
npm i ../packages/validator
```

## Usage

Use the `validate()` function to run validation tasks synchronously. Add checks to run during validation. Handle errors via `onError`.

Check `validate.test.ts` for usage examples, and `/checks` for a list of built-in checks.

```ts
import {
  validate,
  checkDomainCollision,
  checkEdgeCollision,
  checkGoalReached,
} from "validator";

const T = true;
const _ = false;

const domain = {
  width: 2,
  height: 2,
  cells: [
    [T, _],
    [_, _],
  ],
};

const onError = ({ errors }) => {
  /**/ // Return true to keep running validation.
  // Return false to stop immediately.
  return true;
};

validate({
  paths: ["u"],
  domain,
  sources: [{ x: 0, y: 1 }],
  checks: [checkDomainCollision, checkEdgeCollision],
  finalChecks: [checkGoalReached],
  onError,
});
```
