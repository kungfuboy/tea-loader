import {
  hasSymbol,
  parseHeader,
  parseAttr,
  parseContent,
  whatType,
  log
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
    ele = null,
    len = 0,
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
  log(ast);
  return ast;
};

paserTea(tea);

const AST2HTML = ast => {};
