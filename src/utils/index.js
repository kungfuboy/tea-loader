const RegHeader = /\S+\s{/;

const makeMap = string => {
  const list = string.split(",");
  return tag => list.includes(tag);
};

export const isUnaryTag = makeMap(
  "area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr"
);
export const isSVGTag = makeMap(
  "svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view"
);
export const isHTMLTag = makeMap(
  `html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot`
);

export const parseContent = string => {
  // 匹配 -content-
  const res = string.match(/(?<=-).+(?=-)/);
  return res[0];
};

export const parseAttr = string => {
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

export const parseHeader = string => {
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

export const whatType = string => {
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

export const hasSymbol = sign => {
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

export const log = ctx => {
  if (typeof ctx === "string") {
    console.log(ctx);
    return;
  }
  console.log(JSON.stringify(ctx, null, 2));
};
