---
name: analyst
description: "AI 需求分析师：将原始需求转化为结构化 PRD。输入原始需求描述（文字、截图均可），自动调研代码库，输出标准 PRD 到 .ai/artifacts/prd/ 目录。触发词：/analyst、分析需求、写PRD。"
---

# Analyst — 需求分析

按照 `.ai/prompts/analyst.md` 中的完整指引执行。

## 执行

1. 阅读 `.ai/project.yml` 了解项目结构
2. 分析用户输入的需求
3. 调研相关代码（根据 project.yml 的 structure 定位）
4. 如需澄清，向用户提出编号问题列表
5. 生成 PRD 到 `.ai/artifacts/prd/feature-{xxx}.md`

## 输出

PRD 文件，包含：用户故事、验收标准、复杂度评级（S/M/L）。

展示 PRD 核心内容，等用户确认。
