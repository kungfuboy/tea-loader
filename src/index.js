import {
  hasSymbol,
  parseHeader,
  parseAttr,
  parseContent,
  whatType
} from "./utils/index.js";

const tea = `
div.dd.bb#rd {
    span {
        class: test
        :tips: active ? '已选择' : '未选择'
        -列表-
        @click: handleClick(e)
    }
    i
    input.edit
    ul.list {
      v-else
      li {
          v-for: items
          -第{{ $_i }}个-
      }
    }
    App
}
`;

const RegOneLine = /.+[.\n\r]/;
const paserTea = source => {
  const ast = [];
  let _cacheStack = [],
    _cacheEle = null,
    _status = 0,
    _RegRes = null;
  while (source) {
    _RegRes = source.match(RegOneLine);
    if (_RegRes) {
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
          parseAttr(_RegRes[0])
        );
      }
      if (_status === 4) {
        // 解析出 tagName 和 静态属性
        // 如果当前缓存对象没有children属性，则新建一个
        if (!_cacheEle) {
          _cacheEle = {};
        } else {
          _cacheStack.push(_cacheEle);
        }
        _cacheEle = Object.assign({}, parseHeader(_RegRes[0]));
        if (!~_RegRes[0].indexOf("{")) {
          _cacheStack.pop();
        }
      }
      if (_status === 5) {
        // 处理 }
        _cacheEle = _cacheStack.length ? _cacheStack.pop() : null;
      }
      source = source.substring(_RegRes[0].length);
    } else {
      source = "";
    }
  }
  return ast;
};

console.log(paserTea(tea));

const AST2HTML = ast => {};
