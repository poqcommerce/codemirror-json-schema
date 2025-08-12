"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchema = exports.JSONHover = exports.jsonSchemaHover = exports.handleRefresh = exports.JSONValidation = exports.jsonSchemaLinter = exports.JSONCompletion = exports.jsonCompletion = void 0;
var completion_1 = require("./features/completion");
Object.defineProperty(exports, "jsonCompletion", { enumerable: true, get: function () { return completion_1.jsonCompletion; } });
Object.defineProperty(exports, "JSONCompletion", { enumerable: true, get: function () { return completion_1.JSONCompletion; } });
var validation_1 = require("./features/validation");
Object.defineProperty(exports, "jsonSchemaLinter", { enumerable: true, get: function () { return validation_1.jsonSchemaLinter; } });
Object.defineProperty(exports, "JSONValidation", { enumerable: true, get: function () { return validation_1.JSONValidation; } });
Object.defineProperty(exports, "handleRefresh", { enumerable: true, get: function () { return validation_1.handleRefresh; } });
var hover_1 = require("./features/hover");
Object.defineProperty(exports, "jsonSchemaHover", { enumerable: true, get: function () { return hover_1.jsonSchemaHover; } });
Object.defineProperty(exports, "JSONHover", { enumerable: true, get: function () { return hover_1.JSONHover; } });
var bundled_1 = require("./json/bundled");
Object.defineProperty(exports, "jsonSchema", { enumerable: true, get: function () { return bundled_1.jsonSchema; } });
__exportStar(require("./parsers/json-parser"), exports);
__exportStar(require("./utils/json-pointers"), exports);
__exportStar(require("./features/state"), exports);
