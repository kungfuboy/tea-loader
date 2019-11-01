import {
  hasSymbol,
  parseHeader,
  parseAttr,
  parseContent,
  whatType
} from "./utils/index.js";

const RegOneLine = /.+[.\n\r]/;

export const parseTea = source => {
  const ast = [];
  let _cacheStack = [],
    _cacheEle = null,
    ele = null,
    len = 0,
    _status = 0,
    _RegRes = null;
  while (source) {
    _RegRes = source.match(RegOneLine);
    if (_RegRes) {
      if (!_RegRes[0].trim() || !_RegRes[0].trim().indexOf("//")) {
        // 处理空行 和 注释行
        source = source.substring(_RegRes[0].length);
        continue;
      }
      _status = hasSymbol(_RegRes[0]);
      if (!_status) {
        // 这里不做处理，仅改变 status 的状态
        _status = whatType(_RegRes[0]);
      }
      if (_status === 1) {
        // 解析出文本内容
        !_cacheEle.children && (_cacheEle.children = []);
        _cacheEle.children.push({ type: 1, content: parseContent(_RegRes[0]) });
      }
      if (_status === 2) {
        // 解析出 属性
        _cacheEle.attr = Object.assign(
          {},
          _cacheEle.attr,
          parseAttr(_RegRes[0], _cacheEle.attr)
        );
      }
      if (_status === 4) {
        // 解析出 tagName 和 静态属性
        _cacheEle = Object.assign({}, parseHeader(_RegRes[0]));
        _cacheStack.push(_cacheEle);
        !~_RegRes[0].indexOf("{") && (_status = 5);
      }
      if (_status === 5) {
        // 处理 }
        ele = _cacheStack.pop();
        len = _cacheStack.length;
        if (len) {
          !_cacheStack[len - 1].children &&
            (_cacheStack[len - 1].children = []);
          _cacheStack[len - 1].children.push(ele);
        } else {
          ast.push(ele);
        }
        _cacheEle = len ? _cacheStack[len - 1] : null;
      }
      source = source.substring(_RegRes[0].length);
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
