import { log } from "./lib/logger";
export function onRequestError() {
  log("application_error");
}
