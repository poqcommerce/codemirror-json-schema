import { JSONSchema7 } from "json-schema";
import { JSONMode } from "../../../types";
import { jsonSchema } from "../../../json/bundled";

export const getExtensions = (mode: JSONMode, schema?: JSONSchema7) => {
  return jsonSchema(schema);
};
