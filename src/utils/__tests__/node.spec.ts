import { describe, expect, it } from "vitest";
import { JSONMode } from "../../types";
import { MODES } from "../../constants";
import { EditorState } from "@codemirror/state";
import { getNodeAtPosition } from "../node";
import { getExtensions } from "../../features/__tests__/__helpers__";

// complex data structure for testing. Keep these in sync.
const testJsonData = `
{
  "bog": {
    "array": [
      {
        "foo": true
      },
      {
        "bar": 123
      }
    ]
  },
  "bar": 123,
  "baz": [1, 2, 3]
}
`;

const testJson5Data = `
{
  bog: {
    array: [
      {
        'foo': true
      },
      {
        'bar': 123
      }
    ]
  },
  'bar': 123,
  'baz': [1, 2, 3]
}
`;

const testYamlData = `---
bog:
  array:
    - foo: true
    - bar: 123
bar: 123
baz: [1, 2, 3]
`;

const getTestData = (mode: JSONMode) => {
  return testJsonData;
};

describe("getNodeAtPosition", () => {
  it.each([
    {
      mode: MODES.JSON,
      pos: 1,
      expectedName: "JsonText",
    },
    {
      mode: MODES.JSON,
      pos: 6,
      expectedName: "PropertyName",
    },
    {
      mode: MODES.JSON,
      pos: 13,
      expectedName: "{",
    },
    {
      mode: MODES.JSON,
      pos: 28,
      expectedName: "[",
    },
    {
      mode: MODES.JSON,
      pos: 53,
      expectedName: "True",
    },
    {
      mode: MODES.JSON,
      pos: 121,
      expectedName: "Property",
    }
  ])(
    "should return node at position $pos (mode: $mode)",
    ({ mode, expectedName, pos }) => {
      const state = EditorState.create({
        doc: getTestData(mode),
        extensions: [getExtensions(mode)],
      });
      const node = getNodeAtPosition(state, pos);
      expect(node.name).toBe(expectedName);
    },
  );
});
