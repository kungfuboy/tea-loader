export const log = ctx => {
  if (typeof ctx === "string") {
    console.log(ctx);
    return;
  }
  console.log(JSON.stringify(ctx, null, 2));
};

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

const isVueTag = makeMap(`slot,template`);

const isTag = _string => {
  const string = _string.trim();
  return isSVGTag(string) || isHTMLTag(string) || isVueTag(string);
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
    children: [],
    attr: {
      ...obj
    }
  };
};

export const vueBetter = attr => {
  const [left] = Object.keys(attr);
  const right = attr[left];
  switch (left) {
    case "v-for":
      if (!right.match(/\sin\s/)) {
        attr[left] = `($it, $_i) in ${right}`;
        attr[":key"] = "$_i";
      }
      break;

    default:
      break;
  }
  return attr;
};

export const hasSymbol = source => {
  if (source.trim() === "}") {
    return [5];
  }
  if (source.match(/((~{1,2}).+)/)) {
    // 1. 匹配文本
    const _content =
      source.match(/(?<=~~).+(?=\n)/) || source.match(/(?<=~).+(?=~\n)/);
    if (!_content) {
      throw Error(`${source}\nYou miss '~' at begin or end of the line.`);
    }
    return [1, _content[0]];
  }
  if (source.match(/((v-on:)|(@)){1}.+:.+/)) {
    //  2. 匹配事件回调
    const left = source.match(/(?<=(v-on:)|(@)).*(?=:.+)/);
    const _right = source.match(/(?<=(v-on:)|(@)).+/);
    const right = _right[0].slice(_right[0].indexOf(":") + 1).trim();
    return [
      2,
      {
        [`@${left[0]}`]: right
      }
    ];
  }
  if (source.match(/(v-bind)?:(\S+):.+/)) {
    // 3-1. 匹配动态属性
    const left =
      source.match(/(?<=v-bind:)([\S]+)(?=:.+)/) ||
      source.match(/(?<=:)[\S]+(?=:.+)/);
    const _right = source.match(/(?<=v-bind:).+/) || source.match(/(?<=:).+/);
    const right = _right[0].slice(_right[0].search(/:/) + 1).trim();
    return [3, { [`:${left[0]}`]: right }];
  }
  if (source.match(/[\S]+:{1}[\s\S]+?\n/)) {
    // 3-2. 匹配静态属性
    const [left, right] = source.split(":").map(item => item.trim());
    return [3, { [left]: right }];
  }
  if (
    isTag(source) ||
    source.match(
      /(\S+?(([.#&]\S+)|(\s+)){)|(\S+?(([.#&]\S+)|(\s+\n)))|(\s[A-Z]\S+)/
    )
  ) {
    // 4. 匹配 header
    return [4, parseHeader(source)];
  }
  return [2, { [source.trim()]: null }];
};

export const clearComment = string => {
  // 清除所有的注释, 需要处理以下几种情况
  // 1. <!-- xxx -->
  // 2. /* xxx */
  // 3. // xxx
  // 4. 空行
  string = string
    .replace(/\r/, "\n")
    .replace(/\n\n/, "\n")
    .replace(/<!--[\s\S]+?-->/gm, "")
    .replace(/\/\*[\s\S]+?\*\//gm, "")
    .replace(/\/\/[\s\S]+?\n/g, "")
    .replace(/\{\s+\}/g, "")
    .replace(/\n\s+(?=\n)/g, "");
  return string;
};
