import { describe, it } from "vitest";

import { expectCompletion } from "./__helpers__/completion";
import { MODES } from "../../constants";
import {
  testSchema3,
  testSchema4,
  testSchemaConditionalProperties
} from "./__fixtures__/schemas";

describe.each([
  {
    name: "return completion data for simple types",
    mode: MODES.JSON,
    docs: ['{ "f| }', "{ f| }"],
    expectedResults: [
      {
        label: "foo",
        type: "property",
        detail: "string",
        info: "",
        template: '"foo": "#{}"',
      },
    ],
  },
  {
    name: "return completion data for simple types (multiple)",
    mode: MODES.JSON,
    docs: ['{ "one| }'],
    expectedResults: [
      {
        label: "oneOfEg",
        type: "property",
        detail: "",
        info: "an example oneOf",
        template: '"oneOfEg": #{}',
      },
      {
        label: "oneOfEg2",
        type: "property",
        detail: "",
        info: "",
        template: '"oneOfEg2": #{}',
      },
      {
        detail: "",
        info: "",
        label: "oneOfObject",
        template: '"oneOfObject": #{}',
        type: "property",
      },
    ],
  },
  {
    name: "include defaults for string when available",
    mode: MODES.JSON,
    docs: ['{ "stringWithDefault| }'],
    expectedResults: [
      {
        label: "stringWithDefault",
        type: "property",
        detail: "string",
        info: "a string with a default value",
        template: '"stringWithDefault": "${defaultString}"',
      },
    ],
  },
  {
    name: "include defaults for string with braces",
    mode: MODES.JSON,
    docs: ['{ "bracedStringDefault| }'],
    expectedResults: [
      {
        label: "bracedStringDefault",
        type: "property",
        detail: "string",
        info: "a string with a default value containing braces",
        template: '"bracedStringDefault": "${✨ A message from %{whom\\}: ✨}"',
      },
    ],
  },
  {
    name: "include defaults for enum when available",
    mode: MODES.JSON,
    docs: ['{ "en| }'],
    expectedResults: [
      {
        label: "enum1",
        type: "property",
        detail: "",
        info: "an example enum with default bar",
        template: '"enum1": "${bar}"',
      },
      {
        label: "enum2",
        type: "property",
        detail: "",
        info: "an example enum without default",
        template: '"enum2": #{}',
      },
    ],
  },
  {
    name: "include value completions for enum",
    mode: MODES.JSON,
    docs: ['{ "enum1": "|" }'],
    expectedResults: [
      {
        label: "foo",
        apply: '"foo"',
        info: "an example enum with default bar",
      },
      {
        label: "bar",
        apply: '"bar"',
        detail: "Default value",
      },
    ],
  },
  {
    name: "include value completions for enum with filter",
    mode: MODES.JSON,
    docs: ['{ "enum1": "f|" }'],
    expectedResults: [
      {
        label: "foo",
        apply: '"foo"',
        info: "an example enum with default bar",
      },
    ],
  },
  {
    name: "include defaults for boolean when available",
    mode: MODES.JSON,
    docs: ['{ "booleanW| }'],
    expectedResults: [
      {
        type: "property",
        detail: "boolean",
        info: "an example boolean with default",
        label: "booleanWithDefault",
        template: '"booleanWithDefault": ${true}',
      },
    ],
  },
  // TODO: should provide true/false completions. Issue is the detected node is the Property node, which contains the property name and value. The prefix for the autocompletion therefore contains the property name, so it never matches the results
  // {
  //   name: "include value completions for boolean",
  //   mode: MODES.JSON,
  //   docs: ['{ "booleanWithDefault": | }'],
  //   expectedResults: [
  //     {
  //       detail: "boolean",
  //       label: "true",
  //     },
  //     {
  //       detail: "boolean",
  //       label: "false",
  //     },
  //   ],
  // },
  {
    name: "include insert text for objects",
    mode: MODES.JSON,
    docs: ['{ "ob| }'],
    expectedResults: [
      {
        type: "property",
        detail: "object",
        info: "",
        label: "object",
        template: '"object": {#{}}',
      },
      {
        template: '"objectWithRef": {#{}}',
        label: "objectWithRef",
        detail: "",
        info: "",
        type: "property",
      },
    ],
  },
  // this has regressed for json4 only for some reason
  {
    name: "include insert text for nested object properties",
    mode: MODES.JSON,
    docs: ['{ "object": { "|" } }', '{ "object": { "| } }'],
    expectedResults: [
      {
        detail: "string",
        info: "an elegant string",
        label: "foo",
        template: '"foo": "#{}"',
        type: "property",
      },
    ],
  },
  {
    name: "include insert text for nested object properties with filter",
    mode: MODES.JSON,
    docs: ['{ "object": { "f|" } }'],
    expectedResults: [
      {
        detail: "string",
        info: "an elegant string",
        label: "foo",
        template: '"foo": "#{}"',
        type: "property",
      },
    ],
  },
  {
    name: "autocomplete for oneOf with nested definitions and filter",
    mode: MODES.JSON,
    docs: ['{ "oneOfObject": { "f|" } }'],
    expectedResults: [
      {
        detail: "string",
        info: "",
        label: "foo",
        template: '"foo": "#{}"',
        type: "property",
      },
    ],
  },
  {
    name: "autocomplete for oneOf with nested definitions",
    mode: MODES.JSON,
    docs: ['{ "oneOfObject": { "|" } }'],
    expectedResults: [
      {
        detail: "string",
        info: "",
        label: "foo",
        template: '"foo": "#{}"',
        type: "property",
      },
      {
        detail: "number",
        info: "",
        label: "bar",
        template: '"bar": #{0}',
        type: "property",
      },
      {
        detail: "string",
        info: "",
        label: "apple",
        template: '"apple": "#{}"',
        type: "property",
      },
      {
        detail: "number",
        info: "",
        label: "banana",
        template: '"banana": #{0}',
        type: "property",
      },
    ],
  },
  // TODO: completion for array of objects should enhance the template
  {
    name: "autocomplete for array of objects with filter",
    mode: MODES.JSON,
    docs: ['{ "arrayOfObjects": [ { "f|" } ] }'],
    expectedResults: [
      {
        detail: "string",
        info: "",
        label: "foo",
        template: '"foo": "#{}"',
        type: "property",
      },
    ],
  },
  {
    name: "autocomplete for array of objects with items",
    mode: MODES.JSON,
    docs: ['{ "array| }'],
    expectedResults: [
      {
        type: "property",
        detail: "array",
        info: "",
        label: "arrayOfObjects",
        template: '"arrayOfObjects": [#{}]',
      },
      {
        type: "property",
        detail: "array",
        info: "",
        label: "arrayOfOneOf",
        template: '"arrayOfOneOf": [#{}]',
      },
    ],
  },
  {
    name: "autocomplete for array of objects with items (array of objects)",
    mode: MODES.JSON,
    docs: ['{ "arrayOfObjects": [ { "|" } ] }'],
    expectedResults: [
      {
        detail: "string",
        info: "",
        label: "foo",
        template: `"foo": "#{}"`,
        type: "property",
      },
      {
        detail: "number",
        info: "",
        label: "bar",
        template: '"bar": #{0}',
        type: "property",
      },
    ],
  },
  {
    name: "autocomplete for array of objects with items (array of oneOf)",
    mode: MODES.JSON,
    docs: ['{ "arrayOfOneOf": [ { "|" } ] }'],
    expectedResults: [
      {
        detail: "string",
        info: "",
        label: "foo",
        template: '"foo": "#{}"',
        type: "property",
      },
      {
        detail: "number",
        info: "",
        label: "bar",
        template: '"bar": #{0}',
        type: "property",
      },
      {
        detail: "string",
        info: "",
        label: "apple",
        template: '"apple": "#{}"',
        type: "property",
      },
      {
        detail: "number",
        info: "",
        label: "banana",
        template: '"banana": #{0}',
        type: "property",
      },
    ],
  },
  {
    name: "autocomplete for a schema with top level $ref",
    mode: MODES.JSON,
    docs: ['{ "| }'],
    expectedResults: [
      {
        type: "property",
        detail: "string",
        info: "",
        label: "foo",
        template: '"foo": "#{}"',
      },
      {
        type: "property",
        detail: "number",
        info: "",
        label: "bar",
        template: '"bar": #{0}',
      },
    ],
    schema: testSchema3,
  },
  {
    name: "autocomplete for a schema with top level complex type",
    mode: MODES.JSON,
    docs: ['{ "| }'],
    expectedResults: [
      {
        type: "property",
        detail: "string",
        info: "",
        label: "foo",
        template: '"foo": "#{}"',
      },
      {
        type: "property",
        detail: "number",
        info: "",
        label: "bar",
        template: '"bar": #{0}',
      },
    ],
    schema: testSchema4,
  },
  {
    name: "autocomplete for a schema with conditional properties",
    mode: MODES.JSON,
    docs: ['{ "type": "Test_1", "props": { t| }}'],
    expectedResults: [
      {
        type: "property",
        detail: "string",
        info: "",
        label: "test1Props",
        template: '"test1Props": "#{}"',
      },
    ],
    schema: testSchemaConditionalProperties,
  }
])(
  "jsonCompletionFor-testSchemaConditionalPropertiesOnSameObject",
  ({ name, docs, mode, expectedResults, schema }) => {
    it.each(docs)(`${name} (mode: ${mode})`, async (doc) => {
      // if (name === 'autocomplete for array of objects with items (array of objects)') {
      await expectCompletion(doc, expectedResults, { mode, schema });
      // }
    });
  },
);
