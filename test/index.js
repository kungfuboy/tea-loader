const teaLoader = require("../dist/index.js");

const tea = `
  div.dd.bb#rd {
      span {
          class: test
          :tips: active ? '已选择' : '未选择'
          ~列表~
          @click: handleClick(e)
      }
      i {
        ~2019-10-25~
        slot
      }
      // 注释
      input.edit 
      ul.list {
        v-else
        li {
            v-for: items
            ~第{{ $_i }}个~
        }
      }

      App
  }
  `;

console.log(teaLoader(tea));
