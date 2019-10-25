import { parseTea, AST2HTML } from "./parse.js";

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

const res = parseTea(tea);
console.log(res);

console.log(AST2HTML(res));
