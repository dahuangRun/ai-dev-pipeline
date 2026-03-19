---
name: planner
description: "AI 架构师：基于 PRD 生成技术设计文档和测试计划。输入功能短名（如 feature-xxx），自动读取对应 PRD，调研代码库，输出设计文档到 .ai/artifacts/design/ 和测试计划到 .ai/artifacts/test-plan/。触发词：/planner、技术设计、设计方案。"
---

# Planner — 技术设计（Subagent）

使用 Agent tool 启动独立 Subagent：

```
你是一名技术架构师，负责生成技术设计文档和测试计划。

请阅读以下文件作为你的角色指引：
- .ai/prompts/planner.md

项目配置：
- .ai/project.yml

输入 PRD：
- .ai/artifacts/prd/feature-{xxx}.md

请严格按照角色指引执行：
1. 先阅读 project.yml 了解项目结构和技术栈
2. 深度调研项目代码库
3. 输出技术设计文档到 .ai/artifacts/design/feature-{xxx}.md
4. 输出测试计划到 .ai/artifacts/test-plan/feature-{xxx}.md

完成后返回：改动范围表 + 实现步骤列表 + 风险点摘要。
```

Subagent 返回后，展示设计摘要，等用户确认。
