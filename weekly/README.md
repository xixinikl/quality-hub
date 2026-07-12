# 每周个人开发系统回顾数据

`latest.json` 是看板读取的最新周报，历史周报使用 `YYYY-MM-DD.json` 保存。

每周 Codex 自动任务必须写入以下字段：

- `date`：回顾日期；
- `generatedAt`：生成时间；
- `status`：`complete` 或 `waiting`；
- `headline`：本周最重要的一句话；
- `summary`：给用户看的简短说明；
- `learnings`：有证据、值得长期保留的经验；
- `completed`：本周自动完成的事项；
- `needsUser`：确实需要用户处理的事项；
- `next`：下一步最值得做的事情。

周报不得包含完整日志、内部脚本清单、无意义的机器统计或未经验证的推断。
