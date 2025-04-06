import { assertEquals } from "@std/assert";
import { createApp } from "../../main.ts";
import constantDescribe from "../../modules/describe/constant.ts";
import utils from "../library/utils.ts";
import mockConfig from "../helpers/mockConfig/describe.ts";
import MockOpenAI from "../../modules/describe/mock.ts";

// Helper function để tạo mock file
function createMockImageFile(name = "test.jpg", type = "image/jpeg"): File {
  const content = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG magic numbers
  return new File([content], name, { type });
}

const url = utils.getUrl("describe");
const config = mockConfig();

// deno-lint-ignore no-explicit-any
const OpenAI: any = new MockOpenAI.MockOpenAI();
// deno-lint-ignore no-explicit-any
const errorOpenAI: any = new MockOpenAI.MockErrOpenAI();

// Test API /describe
Deno.test("POST /describe - should return 400 when no image is provided", async () => {
  const formData = new FormData();
  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const app = createApp(config, OpenAI);
  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.status, constantDescribe.status.NO_IMAGE_IS_PROVIDED.code);
});

Deno.test("POST /describe - should successfully describe image with type=alt", async () => {
  const app = createApp(config, OpenAI);

  const formData = new FormData();
  const mockFile = createMockImageFile();
  formData.append("image", mockFile);
  formData.append("type", "alt");

  // const req = new Request("http://localhost:8000/describe", {
  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.status, constantDescribe.status.OK.code);
  assertEquals(data.data, "Đây là một bức ảnh đẹp");
});

Deno.test("POST /describe - should successfully describe image without type", async () => {
  const app = createApp(config, OpenAI);
  const formData = new FormData();
  const mockFile = createMockImageFile();
  formData.append("image", mockFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 200);
  assertEquals(data.status, constantDescribe.status.OK.code);
  assertEquals(data.data, "Đây là một bức ảnh đẹp");
});

// Test error handling
Deno.test("Error handling - should handle OpenAI errors gracefully", async () => {
  const formData = new FormData();
  const mockFile = createMockImageFile();
  formData.append("image", mockFile);

  const req = new Request(url, {
    method: "POST",
    body: formData,
  });

  const app = createApp(config, errorOpenAI);
  const res = await app.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 500);
  assertEquals(data.status, constantDescribe.status.PROCESSING_ERROR.code);
});
