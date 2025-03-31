import type { Result } from "ts-results";
import { Err, Ok } from "ts-results";

function validateFileSize(config: any, fileSize: number): Result<void, string> {
  const fileSizeConfig = config.upload.image.fileSize;

  if (!fileSizeConfig.enabled.value) {
    return Ok.EMPTY;
  }

  if (fileSize < fileSizeConfig.minSize) {
    return new Err("invalid_minSize");
  }

  if (fileSize > fileSizeConfig.maxSize) {
    return new Err("invalid_maxSize");
  }

  return Ok.EMPTY;
}

export default {
  validateFileSize,
};
