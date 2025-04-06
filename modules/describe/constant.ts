const status = {
  NO_IMAGE_IS_PROVIDED: {
    code: "DESCRIBE_101",
    description: "error happens when server get no image",
    message: "No image is provided",
  },
  PROCESSING_ERROR: {
    code: "DESCRIBE_102",
    description: "error happens in description process",
    message: "There is an error when handling the description of the picture",
  },
  OK: {
    code: "describe_103",
    description:
      "we get description from provider, and then return to consumer",
    message: "There is a successful description process",
  },
};

export default { status };
