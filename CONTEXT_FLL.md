# SQDev Daily Context (Scheduled)

Last updated: 2026-04-15

## Update Policy
- 从现在开始：上下文不再按“每次变更”即时更新。
- 统一改为：**每天 17:00** 保存一次到本文件 `CONTEXT_FLL.md`。
- `CONTEXT_FULL.md` 作为历史参考保留，不再作为高频更新目标。

## Current Baseline
- 反馈系统已上线：右侧悬浮入口（首页 + 工作台）、反馈弹窗、在线提交与本地草稿兜底。
- 反馈后端：`supabase/functions/feedback`，需要已部署并与 `feedback_entries` 表配套。
- 若本地访问反馈接口，需要允许本地源：`ALLOW_LOCALHOST_ORIGIN=1`（并重新部署函数）。
