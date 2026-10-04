import { ownerPolicy } from "./owner-policy";
import { adminPolicy } from "./admin-policy";
import { permitPolicy } from "./permit-policy";
import type { Policy } from "../Policy";

export { ownerPolicy } from "./owner-policy";
export { adminPolicy } from "./admin-policy";
export { permitPolicy } from "./permit-policy";

export const defaultPolicies: readonly Policy[] = [
  ownerPolicy,
  adminPolicy,
  permitPolicy,
];
