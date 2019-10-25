## 安装

```bash
yarn add tea-loader -D

#or

npm i tea-loader -D
```

## 配置

```js
// webpack.config.js -> module.rules
{
  test: /\.tea$/,
  loader: 'tea-loader'
}
```

如果你使用了NuxtJS框架，那作如下配置：

```js
// nuxt.config.js -> module.build
extend(config, ctx) {
  config.module.rules.push({
    test: /\.tea$/,
    loader: 'tea-loader'
  })
}
```

然后在模板中就可以使用了：

```
<template lang="tea">
div {
	h1 {
		~Hello world!~
	}
}
</template>
```

## 语法

Tea尽可能使用简介的语法，主要使用花括号对来表达嵌套逻辑。如：

```
// html
<div>
	<span></span>
	<input />
</div>

// tea
div {
	span
	input
}
```

你不需要关心input标签是单闭合标签，tea会帮你处理。如果标签内部没有值和属性，则后面不需要跟着花括号。

```
// html
<div class="col foo">
	<span :class="active" @click="handleClick">Click Me</span>
	<input class="edit" />
</div>

// tea
div.col.foo {
	span {
		:class: active
		@click: handleClick
		~Click Me~
	}
	input.edit
}
```

为了少敲几次键盘，如果静态的class、id、ref属性，可以直接跟在标签名后面。

* `class`使用`.`字符
* `id`使用`#`字符
* `ref`使用`&`字符

如果是动态属性，如`:class`或一些并不算太常用的属性，还是需要写在花括号内，当然，你不使用简写也没有问题：

```
span {
	class: foo
}
// 等效于
span.foo
```

Tea使用`~ ~`来标识标签内的文本内容，如上面的例子所示，文本内容和属性不存在先后顺序，但是与所嵌套的标签或组件是有顺序关系的，如：

```
// tea
span {
	~Click~
	i
}
// 会渲染成
<span>Click<i></i><span>
```

> 请注意，目前~ ~内不支持多行文本，会尽快支持。