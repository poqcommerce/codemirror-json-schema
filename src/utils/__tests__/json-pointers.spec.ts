import { describe, it, expect } from "vitest";

import { getJsonPointers, jsonPointerForPosition } from "../json-pointers";
import { EditorState } from "@codemirror/state";
import { MODES } from "../../constants";
import { getExtensions } from "../../features/__tests__/__helpers__/index";

describe("jsonPointerForPosition", () => {
  it.each([
    {
      name: "simple",
      doc: '{"object": { "foo": true }, "bar": 123}',
      pos: 14,
      expected: "/object/foo",
      mode: MODES.JSON,
    },
    {
      name: "associative array",
      doc: '[{"object": [{ "foo": true }], "bar": 123}]',
      pos: 16,
      expected: "/0/object/0/foo",
      mode: MODES.JSON,
    },
    {
      name: "deep associative array",
      doc: '[{"object": [{ "foo": { "example": true } }], "bar": 123}]',
      pos: 27,
      expected: "/0/object/0/foo/example",
      mode: MODES.JSON,
    }
  ])(
    "should return full pointer path for a position for $name, mode: $mode",
    ({ doc, mode, pos, expected }) => {
      const state = EditorState.create({
        doc,
        extensions: [getExtensions(mode)],
      });
      const pointer = jsonPointerForPosition(state, pos, 1, mode);
      expect(pointer).toEqual(expected);
    }
  );
});

describe("getJsonPointers", () => {
  it.each([
    {
      doc: '{"object": { "foo": true }, "bar": 123, "baz": [1,2,3], "boop": [{"foo": true}]}',
      mode: MODES.JSON,
      expected: {
        "": {
          keyFrom: 0,
          keyTo: 80,
        },
        "/bar": {
          keyFrom: 28,
          keyTo: 33,
          valueFrom: 35,
          valueTo: 38,
        },
        "/baz": {
          keyFrom: 40,
          keyTo: 45,
          valueFrom: 47,
          valueTo: 54,
        },
        // TODO: return pointers for all array indexes, not just objects
        // "/baz/0": {
        //   keyFrom: 40,
        //   keyTo: 45,
        //   valueFrom: 47,
        //   valueTo: 55,
        // },
        "/boop": {
          keyFrom: 56,
          keyTo: 62,
          valueFrom: 64,
          valueTo: 79,
        },
        "/boop/0": {
          keyFrom: 65,
          keyTo: 78,
          // TODO: These look erroneous. There is no key-value pair for array items
          valueFrom: 78,
          valueTo: 79,
        },
        "/boop/0/foo": {
          keyFrom: 66,
          keyTo: 71,
          valueFrom: 73,
          valueTo: 77,
        },
        "/object": {
          keyFrom: 11,
          keyTo: 26,
        },
        "/object/foo": {
          keyFrom: 13,
          keyTo: 18,
          valueFrom: 20,
          valueTo: 24,
        },
      },
    }
  ])(
    "should return a map of all pointers for a document (mode: $mode)",
    ({ doc, mode, expected }) => {
      const state = EditorState.create({
        doc,
        extensions: [getExtensions(mode)],
      });
      const pointers = getJsonPointers(state, mode);
      expect(Object.fromEntries(pointers.entries())).toEqual(expected);
    }
  );
});
