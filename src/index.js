import { parseTea, AST2HTML } from "./parse.js";

export default function(source) {
  const res = parseTea(source);
  return AST2HTML(res);
}
