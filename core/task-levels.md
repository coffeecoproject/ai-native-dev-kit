# Task Levels

## 为什么要分级

完整流程很重要，但每个小改动都走完整流程会拖慢开发。

任务分级的目标是让流程强度匹配风险。

## Level 0: Small Change

适用：

- 文案修改
- 简单样式修正
- 无业务影响的小 bug
- 无接口、数据、权限变更

要求：

- 直接修改
- 跑相关 verification
- final report 说明测试结果

不要求：

- request card
- preflight
- full spec
- eval pack

## Level 1: Normal Feature

适用：

- 单页面功能
- 单接口功能
- 局部组件
- 不涉及权限模型、数据迁移和生产风险

要求：

- spec
- task card
- verification
- 简短 AI task log

可选：

- eval
- PR review gate

## Level 2: Cross-module / Sensitive Feature

适用：

- 跨模块改动
- 涉及权限、数据隔离、API contract
- 涉及架构边界
- 涉及新依赖
- 涉及可观测性或发布风险

要求：

- request card
- preflight
- spec
- eval
- task card
- risk gate
- verification
- review gate
- AI task log

## Level 3: High-risk / Regulated Change

适用：

- auth / session / token / cookie 策略
- regulated or irreversible operations
- value transfer
- safety-critical behavior
- production data migration
- destructive data operation
- production config / secret / infrastructure
- compliance / privacy / regulated data

要求：

- 完整流程
- 人工批准
- rollback plan
- audit trail
- release gate
- post-release monitoring

默认规则：

如果不确定任务等级，按更高一级处理。
