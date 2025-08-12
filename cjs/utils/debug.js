"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
const loglevel_1 = __importDefault(require("loglevel"));
loglevel_1.default.setLevel(process.env.NODE_ENV !== "development" ? "silent" : "debug");
exports.debug = loglevel_1.default;
