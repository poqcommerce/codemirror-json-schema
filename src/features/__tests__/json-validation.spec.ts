import { JSONSchema7 } from "json-schema";
import { JSONValidation } from "../validation";
import type { Diagnostic } from "@codemirror/lint";
import { describe, it, expect } from "vitest";
import { EditorView } from "@codemirror/view";

import {
  testSchema,
  testSchema2,
  testSchemaArrayOfObjects,
} from "./__fixtures__/schemas";
import { JSONMode } from "../../types";
import { getExtensions } from "./__helpers__/index";
import { MODES } from "../../constants";

const getErrors = (
  jsonString: string,
  mode: JSONMode,
  schema?: JSONSchema7,
) => {
  const view = new EditorView({
    doc: jsonString,
    extensions: [getExtensions(mode, schema ?? testSchema)],
  });
  return new JSONValidation({ mode }).doValidation(view);
};

const common = {
  severity: "error" as Diagnostic["severity"],
  source: "json-schema",
};

const expectErrors = (
  jsonString: string,
  errors: [from: number | undefined, to: number | undefined, message: string][],
  mode: JSONMode,
  schema?: JSONSchema7,
) => {
  const filteredErrors = getErrors(jsonString, mode, schema).map(
    ({ renderMessage, ...error }) => error,
  );
  expect(filteredErrors).toEqual(
    errors.map(([from, to, message]) => ({ ...common, from, to, message })),
  );
};

describe("json-validation", () => {
  const jsonSuite = [
    {
      name: "provide range for a value error",
      mode: MODES.JSON,
      doc: '{"foo": 123}',
      errors: [
        {
          from: 8,
          to: 11,
          message: "Expected `string` but received `number`",
        },
      ],
    },
    {
      name: "provide range for an unknown key error",
      mode: MODES.JSON,
      doc: '{"foo": "example", "bar": 123}',
      errors: [
        {
          from: 19,
          to: 24,
          message: "Additional property `bar` is not allowed",
        },
      ],
    },
    {
      name: "can handle invalid json",
      mode: MODES.JSON,
      doc: '{"foo": "example" "bar": 123}',
      // TODO: we don't have a best effort parser for YAML yet so this test will fail
      skipYaml: true,
      errors: [
        {
          from: 18,
          message: "Additional property `bar` is not allowed",
          to: 23,
        },
      ],
    },
    {
      name: "provide range for invalid multiline json",
      mode: MODES.JSON,
      doc: `{
        "foo": "example",
    "bar": "something else"
  }`,
      errors: [
        {
          from: 32,
          to: 37,
          message: "Additional property `bar` is not allowed",
        },
      ],
    },
    {
      name: "provide formatted error message when required fields are missing",
      mode: MODES.JSON,
      doc: `{
        "foo": "example",
        "object": {}
  }`,
      errors: [
        {
          from: 46,
          to: 48,
          message: "The required property `foo` is missing at `object`",
        },
      ],
      schema: testSchema2,
    },
    {
      name: "provide formatted error message for oneOf fields with more than 2 items",
      mode: MODES.JSON,
      doc: `{
        "foo": "example",
        "object": { "foo": "true" },
    "oneOfEg": 123
  }`,
      errors: [
        {
          from: 80,
          to: 83,
          message: "Expected one of `string`, `array`, or `boolean`",
        },
      ],
      schema: testSchema2,
    },
    {
      name: "provide formatted error message for oneOf fields with less than 2 items",
      mode: MODES.JSON,
      doc: `{
        "foo": "example",
        "object": { "foo": "true" },
    "oneOfEg2": 123
  }`,
      errors: [
        {
          from: 81,
          to: 84,
          message: "Expected one of `string` or `array`",
        },
      ],
      schema: testSchema2,
    },
    {
      name: "reject a single object when schema expects an array",
      mode: MODES.JSON,
      doc: '{ "name": "John" }',
      errors: [
        {
          from: 0,
          to: 0,
          message: "Expected `array` but received `object`",
        },
      ],
      schema: testSchemaArrayOfObjects,
    },
    {
      name: "reject a boolean when schema expects an array",
      mode: MODES.JSON,
      doc: "true",
      errors: [
        {
          from: 0,
          to: 0,
          message: "Expected `array` but received `boolean`",
        },
      ],
      schema: testSchemaArrayOfObjects,
    },
    {
      name: "reject a string when schema expects an array",
      mode: MODES.JSON,
      doc: '"example"',
      errors: [
        {
          from: 0,
          to: 0,
          message: "Expected `array` but received `string`",
        },
      ],
      schema: testSchemaArrayOfObjects,
    },
    {
      name: "reject a number when schema expects an array",
      mode: MODES.JSON,
      doc: "123",
      errors: [
        {
          from: 0,
          to: 0,
          message: "Expected `array` but received `number`",
        },
      ],
      schema: testSchemaArrayOfObjects,
    },
    {
      name: "can handle an array of objects",
      mode: MODES.JSON,
      doc: '[{"name": "John"}, {"name": "Jane"}]',
      errors: [],
      schema: testSchemaArrayOfObjects,
    },
  ];
  it.each(jsonSuite)(
    "$name (mode: $mode)",
    ({ doc, mode, errors, schema }) => {
      expectErrors(
        doc,
        errors.map((error) => [error.from, error.to, error.message]),
        mode,
        schema,
      );
    },
  );
});
