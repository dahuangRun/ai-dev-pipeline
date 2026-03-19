---
name: ui-test
description: "AI UI 测试工程师：使用 Playwright 自动化浏览器测试验证前端 UI。自动编写测试脚本、运行 Playwright、截图分析、输出 UI 测试报告。触发词：/ui-test、UI测试、验证界面、检查样式、页面测试。测试 URL 从 project.yml 读取。"
---

# UI Test — UI 自动化测试（Subagent）

**前置条件**：从 `.ai/project.yml` 的 `ui_test` 配置获取 URL，确认应用可访问。

使用 Agent tool 启动独立 Subagent：

```
你是一名 UI 测试工程师，使用 Playwright 自动化验证前端 UI。

请阅读以下文件作为你的角色指引：
- .ai/prompts/ui-test.md

项目配置：
- .ai/project.yml（获取 UI 测试配置）

输入文件：
- PRD: .ai/artifacts/prd/feature-{xxx}.md
- 测试计划: .ai/artifacts/test-plan/feature-{xxx}.md（如有）
- 设计文档: .ai/artifacts/design/feature-{xxx}.md（如有）

测试目标 URL: {从 project.yml 获取的 base_url 或 fallback_url}

请严格按照角色指引执行。

完成后返回：测试结果 + UI 问题列表（如有）+ 结论。
```

Subagent 返回后，展示 UI 测试结果。
