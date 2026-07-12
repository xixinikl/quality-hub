# Xixi 个人开发系统

这是跨电脑和跨 Codex 的公开入口说明。系统的唯一操作入口是
[`xixi-dev-system`](https://github.com/xixinikl/xixi-dev-system)。

## 完整链路

```text
xixi-dev-system
  -> 同步 xixi-agent-profile
  -> 调用 standard-project-workflow
  -> 使用 codex-acceptance-factory 生成证据
  -> 各产品发布质量报告
  -> Quality Hub 展示当前结论与每周回顾
```

## 仓库角色

| 仓库 | 角色 |
|---|---|
| `xixi-dev-system` | 唯一入口、安装器、运行时与系统清单 |
| `xixi-agent-profile` | 跨电脑个人偏好与已验证经验 |
| `standard-project-workflow` | 正式开发任务的阶段门禁 |
| `codex-acceptance-factory` | 真实检查、证据压缩和保守修复能力 |
| `quality-hub` | 用户查看状态、下一步和周报的网站 |
| `gongtu-project`、`code-quest`、`canvas-storm` | 独立产品仓库，各自保留自己的视觉与项目规则 |

## 新电脑恢复

```bash
git clone https://github.com/xixinikl/xixi-dev-system.git
cd xixi-dev-system
bin/bootstrap-new-machine.sh --workspace "/path/to/your/Codex/workspace"
bin/system-doctor.sh
```

恢复命令会安装统一入口、同步 Profile、安装正式流程与验收 Skill，并重建每周一上午 8:00 的个人开发系统回顾。

## 权限说明

公开仓库允许任何人读取和 fork；只有 owner 或被授予 Write 权限的 GitHub 用户能直接向原仓库推送更新。Codex 使用哪个 GitHub 身份，就继承该身份的仓库权限。
