# @lazebird/vite-plugin-langspack

## 介绍

- 辅助一种项目国际化模式：开发阶段采用多目录结构开发，便于开发人员查看和修改；发布时采用每语言单一翻译文件独立发布方式，便于客户定制和后期修改维护
- <a href="https://lazebird.github.io/vite-plugin-langspack/" target="_blank">预览</a>
- <a href="https://www.npmjs.com/package/@lazebird/vite-plugin-langspack" target="_blank">npmjs</a>

# Todo

- [x] 去掉配置中的 mode 字段，简化配置

# 问题

## ~~Unknown variable dynamic import~~

- import 默认需要实体文件，因此在项目 langs/目录存在 2 个空文件 zh_CN.js 和 en_US.js；否则插件不会处理该 import 资源
- 且在外扩新语种时，比如 zh_TW，由于编译时 import 未处理该文件，也会导致出错，可选自行处理该问题，做法参考

```js
let msgs = [];
if (import.meta.env.DEV) msgs = await (await import(`../../../langs/${locale}.js`))?.default;
else msgs = await (await axios.get(`/${locale}.json`)).data;
```

- 考虑后续通过虚拟模块重构来解决该问题，并且将语言作为一个参数项而非路径项
