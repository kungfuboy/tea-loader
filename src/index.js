import { parseTea, AST2HTML } from "./parse.js";

module.exports = function(source) {
  const res = parseTea(source);
  return AST2HTML(res);
};
