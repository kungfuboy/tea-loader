'use strict';

const makeMap = string => {
  const list = string.split(",");
  return tag => list.includes(tag);
};

const isUnaryTag = makeMap(
  "area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr"
);
const isSVGTag = makeMap(
  "svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view"
);
const isHTMLTag = makeMap(
  `html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot`
);

const isVueTag = makeMap(`slot`);

const parseHeader = string => {
  const _index = string.indexOf("{"),
    reg = /(\S+?)(?=[\.#&\s])/,
    ele = {};
  let res = "",
    tagName = "";
  string = ~_index ? string.slice(0, _index) : string;
  res = string.match(reg);
  tagName = res ? res[0] : string;
  string = string.substring(tagName.length);
  while (string) {
    res = string.match(reg);
    if (!res) {
      string = "";
      continue;
    }
    if (res[0].indexOf(".") === 0) {
      !ele.class && (ele.class = []);
      ele.class.push(res[0].slice(1));
    }
    if (res[0].indexOf("#") === 0) {
      !ele.id && (ele.id = []);
      ele.id.push(res[0].slice(1));
    }
    if (res[0].indexOf("&") === 0) {
      !ele.ref && (ele.ref = []);
      ele.ref.push(res[0].slice(1));
    }
    string = string.substring(res[0].length);
  }
  const keys = Object.keys(ele);
  const obj = {};
  keys.forEach(key => {
    obj[key] = ele[key].join(" ");
  });
  return {
    tagName,
    isSingle: isUnaryTag(tagName),
    type: 2,
    attr: {
      ...obj
    }
  };
};

const whatType = string => {
  // 传入的字符串没有明显的标识，有以下几种情况
  // 1. 原生标签
  // 2. 属性
  // 3. 组件
  const res = string.match(/(\S+?)(?=[\.#&\s])/);
  if (isHTMLTag(res[0]) || isSVGTag(res[0]) || isVueTag(res[0])) {
    //   原生标签
    return 4;
  }
  if (~string.search(/(?<=[A-Z]).+/)) {
    //   组件
    return 4;
  }
  //   属性
  return 2;
};

const parseContent = string => {
  // 匹配 -content-
  const res = string.match(/(?<=~).+(?=~)/);
  return res[0];
};

const parseAttr = string => {
  string = string.trim();
  let _index = string.indexOf(":"),
    left,
    right,
    isStatic = true;
  if (_index === 0) {
    // 说明是动态属性，先切除
    string = string.substring(1);
    isStatic = false;
    _index = string.indexOf(":");
  }
  left = ~_index ? string.slice(0, _index) : string;
  right = ~_index ? `${string.slice(_index + 1).trim()}` : null;
  return {
    [isStatic ? left : `:${left}`]: right
  };
};

const hasSymbol = sign => {
  if (~sign.search(/(?<=\s~).+(?=~\s)/)) {
    // 文本
    return 1;
  }
  if (~sign.indexOf(":")) {
    return 2;
  }
  if (~sign.indexOf("{{")) {
    return 3;
  }
  if (~sign.indexOf("{")) {
    return 4;
  }
  if (sign.trim() === "}") {
    return 5;
  }
  return 0;
};

const RegOneLine = /.+[.\n\r]/;

const parseTea = source => {
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

const AST2HTML = ast => {
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

module.exports = function(source) {
  const res = parseTea(source);
  return AST2HTML(res);
};
