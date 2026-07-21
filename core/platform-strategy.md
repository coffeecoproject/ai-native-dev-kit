# Platform Strategy

## 原则

核心工作流不绑定平台。

```text
Request
Preflight
Spec
Eval
Task
Execution
Verification
Review
Release
Learning
```

这些阶段对 Codex、Cursor、Claude、GitHub Copilot、人工团队都成立。

平台只负责不同入口和不同执行机制。

## 平台适配

| Platform | 适配资产 | 用途 |
|---|---|---|
| Codex | `AGENTS.md`, optional Skill | 仓库规则、执行角色、task scope |
| Cursor | rules / project instructions | 编辑器内规则和上下文 |
| Claude | project instructions / commands | 对话式 spec、review、repair |
| GitHub | PR template, Actions | 合并门禁、证据、审查记录 |
| Local scripts | `scripts/verify.sh`, checks | 硬验证和完整性检查 |

## 防跑偏优先级

1. 明确的项目文件和 task card
2. 自动检查脚本和 CI
3. PR template 和 IntentOS/Codex review；真实外部影响仍使用具体同意记录
4. AGENTS.md / rules / instructions
5. Skill 或 prompt

Skill 是软约束，CI 和 tests 是硬约束。
