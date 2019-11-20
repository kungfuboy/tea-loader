const performance = require("perf_hooks").performance;
const teaLoader = require("../dist/index.js");

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

  const tea2 = `
  section.maintain-list {
    ul {
        li {
            v-for: list
            i.left {

            }
            div.right {
                p.top {
                    ~~{{$it.title}}
                }
                span.bottom {
                    span.time {
                        ~~{{$it.time | timeFormat}}
                    }
                    span.status {

                    }
                }
            }
        }
    }
}
`

const start = performance.now();
console.log(teaLoader(tea2));
console.log(`\n 🚀 🚀 🚀 运行时间：${performance.now() - start} ms`);
