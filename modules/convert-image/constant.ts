const status = {
  NO_IMAGE_IS_PROVIDED: {
    code: "CONVERT_IMAGE_101",
    description: "error happens when server get no image",
    message: "No image is provided",
  },
  ERROR_IMAGE_PROCESSING: {
    code: "CONVERT_IMAGE_102",
    descriptin: "error happens in image processing",
    message: "There is an error when process the image",
  },
  OK: {
    code: "CONVERT_IMAGE_103",
    description: "We get image, then return success",
    message: "We got the image",
  },
  ERROR_MIN_SIZE: {
    code: "CONVERT_IMAGE_104",
    description:
      "in config.json, when fileSize is enable and the image is lessen than minSize",
    message: "Your file should be larger than {{minSize}}",
  },
  ERROR_MAX_SIZE: {
    code: "CONVERT_IMAGE_105",
    description:
      "in config.json, when fileSize is enable and the image is over the maxSize",
    message: "Your file should be maximum size of {{maxSize}}",
  },
  INVALID_IMAGE: {
    code: "CONVERT_IMAGE_106",
    description:
      "error happens when image is invalid like the image doesn't have any bit",
    message: "Invalid image",
  },
  EXCEEDS_PIXEL_LIMIT: {
    code: "CONVERT_IMAGE_107",
    description:
      "error happens when pixels of image exceeds the limit. Pixels is width * height",
    message: "Exceeds pixel limit",
  },
};

export default { status };
