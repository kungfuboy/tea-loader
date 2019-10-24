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

const parseContent = string => {
  // 匹配 -content-
  const res = string.match(/(?<=-).+(?=-)/);
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
  if (isHTMLTag(res[0]) || isSVGTag(res[0])) {
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

const hasSymbol = sign => {
  if (~sign.search(/(?<=-).+(?=-)/)) {
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
