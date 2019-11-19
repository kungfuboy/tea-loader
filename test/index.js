const performance = require("perf_hooks").performance;
const teaLoader = require("../dist/index.js");

const log = ctx => {
  if (typeof ctx === "string") {
    console.log(ctx);
    return;
  }
  console.log(JSON.stringify(ctx, null, 2));
};

const tea = `
  div.dd.bb#rd&fe {
      span {
          class: test
          :tips: active ? '已选择' : '未选择'
          ~~列表
          v-show
          require
          @click: handleClick(e)
      }
      section.eagle {
        
      }
      i.icon {
        ~2019-10-25~
        slot
      }
      // 注释
      input.edit 
      ul.list {
        /* i.love {
            v-if: love
        }*/
        li {
            v-for: items
            ~~第{{ $_i }}个
        }
      }
      a.dir {
        v-bind:href: url
        v-on:click: hanleClick
      }

      App
  }
  Main
  section {
    slot
  }
  `;

const start = performance.now();
console.log(teaLoader(tea));
console.log(`\n 🚀 🚀 🚀 运行时间：${performance.now() - start} ms`);
