import { parseTea, AST2HTML } from "./parse.js";

export default function(_source) {
  let res;
  try {
    res = JSON.parse(_source);
  } catch (error) {
    res = JSON.parse(parseTea(_source));
  }
  return AST2HTML(res);
}
