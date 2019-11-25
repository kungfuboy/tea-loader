import { hasSymbol, clearComment, vueBetter, log } from "./utils/index.js";

const RegOneLine = /.+\n/;

export const parseTea = source => {
  source = clearComment(source);
  const ast = [],
    clearCacheEle = () => ({ children: [] });
  let _cacheStack = [],
    _cacheEle = clearCacheEle(),
    ele = null,
    len = 0,
    _RegRes = null,
    _lineSource = "";
  while (source) {
    _RegRes = source.match(RegOneLine);
    if (_RegRes) {
      _lineSource = _RegRes[0];
      if (!_lineSource.trim()) {
        // 处理空行
        source = source.substring(_lineSource.length);
        continue;
      }
      let [_status, res] = hasSymbol(_lineSource);
      if (_status === 1) {
        // 解析出文本内容
        _cacheEle.children.push({
          type: 1,
          content: res
        });
      }
      if ([2, 3].includes(_status)) {
        // 解析出 事件回调
        // 解析出 动态属性
        _cacheEle.attr = Object.assign({}, _cacheEle.attr, vueBetter(res));
      }
      if (_status === 4) {
        // 解析出 tagName 和 静态属性
        _cacheEle = Object.assign({}, res);
        _cacheStack.push(_cacheEle);
        (!~_lineSource.indexOf("{") || ~_lineSource.indexOf("{}")) &&
          (_status = 5);
      }
      if (_status === 5) {
        // 处理 }
        ele = _cacheStack.pop();
        len = _cacheStack.length;
        if (len) {
          _cacheStack[len - 1].children.push(ele);
        } else {
          ast.push(ele);
        }
        _cacheEle = len ? _cacheStack[len - 1] : clearCacheEle();
      }
      source = source.substring(_lineSource.length);
    } else {
      source = "";
    }
  }
  return ast;
};

const renderAttr = attr => {
  if (!attr) {
    return "";
  }
  const keys = Object.keys(attr);
  const res = keys
    .map(key => (attr[key] ? `${key}="${attr[key]}"` : `${key}`))
    .join(" ");
  return keys.length ? ` ${res}` : "";
};

export const AST2HTML = ast => {
  if (!ast || !ast.length) {
    return "";
  }
  return ast
    .map(ele => {
      if (ele.type === 1) {
        return ele.content;
      }
      if (ele.isSingle) {
        return `<${ele.tagName}${renderAttr(ele.attr)} />`;
      }
      return `<${ele.tagName}${renderAttr(ele.attr)}>${AST2HTML(
        ele.children
      )}</${ele.tagName}>`;
    })
    .join("");
};
