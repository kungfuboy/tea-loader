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
`;

const tea3 = `
section.complaint {
    Header {
        subtitle: 意见反馈
    }
    div.handle {
        span.left {
            ~反馈类型~
            
        }
        span {
            ~投诉~
            :class: ['right', {'red': $it.status}]
            ~~{{$it.msg}}
        }
    }
    div.content {
        textarea {
            placeholder: 请简明叙述下问题吧~
        }
        <!-- 组件欠缺 -->
        ul.img-list {
            li.img-li {
                v-for: imgList
            }
            li.add {
                v-show: imgList.length < 9
            }
        }
    }
    div.big-btn {
        ~确认提交~
    }
}
`;

const tea4 = `
section.maintain-detail {
    Header {
        title: 报修明细
        bottomLine
    }
    ul.list {
      li {
          v-for: msgList
          span.left {
              ~~{{$it.label}}
          }
          span {
              :class: ['right', {'red': $it.status}]
              ~~{{$it.msg}}
          }    
      }
    }
}   
`;

const start = performance.now();
console.log(teaLoader(tea4));
console.log(`\n 🚀 🚀 🚀 运行时间：${performance.now() - start} ms`);
