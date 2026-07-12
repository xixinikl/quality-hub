# 我的项目看板

## 仓库身份

| 项目 | 说明 |
|---|---|
| 类型 | 展示仓库：个人开发系统的用户入口，不是产品前端模板。 |
| 协作关系 | 读取各产品公开质量报告；接收每周 Codex 回顾；由 `xixi-dev-system` 维护接入契约。 |
| 平时需要打开吗 | 需要。想知道“本周要不要处理、下一步是什么”时只看这里。 |
| 当前状态 | 使用中，当前接入公途、码上冒险和 Canvas Storm。 |
| 新电脑恢复 | 无需安装即可访问 GitHub Pages；维护时 `git clone` 后运行 `node scripts/verify.mjs`。 |

这是 Xixi Dev System 的用户入口，用一句人话回答三个问题：

1. 现在有没有事情需要我处理？
2. 每个项目唯一的下一步是什么？
3. 系统这周学会了什么？

看板只聚合各项目公开的报告数据，不运行项目代码，也不读取业务仓库内容。不同产品保留各自的视觉设计；这里统一的是状态、下一步和周报表达。

## 本地预览

```bash
python3 -m http.server 8000
```

打开 <http://127.0.0.1:8000>。

## 验证

```bash
node scripts/verify.mjs
```

## 接入项目

在 `projects.json` 中登记项目名称、报告地址和仓库地址。项目至少需要发布：

- `data/latest.json`
- `data/index.json`

如果项目进一步提供 `weeklySummaryUrl`，看板会展示其中的 `learnings`。

统一的每周个人开发系统回顾保存在 `weekly/latest.json`，历史版本按日期保存在 `weekly/`。该数据由 Codex 周一自动任务通过独立 PR 更新。

跨电脑安装、仓库关系和权限说明见 [`SYSTEM_OVERVIEW.md`](SYSTEM_OVERVIEW.md)。
