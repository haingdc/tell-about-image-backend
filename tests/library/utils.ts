import { port } from "../../main.ts";

function getUrl(endpoint: string) {
  return new URL(endpoint, "http://localhost:" + port).toString();
}

export { getUrl };
