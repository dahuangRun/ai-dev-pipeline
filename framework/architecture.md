# AI 开发流水线 — 系统架构

## 概述

这是一个基于 Claude Code 的 AI 驱动全自动开发流水线框架。通过 Skill + Subagent 混合架构，实现从需求到部署的完整自动化流程。

本框架**与具体技术栈无关**，通过 `.ai/project.yml` 配置文件适配任意项目。

## 核心架构：Skill + Subagent 混合

### 两种执行机制

| 机制 | 上下文 | 交互能力 | 适用角色 |
|------|--------|---------|---------|
| **Skill** | 共享主会话上下文 | 可与用户交互 | Analyst, Ship |
| **Subagent** | 独立上下文（隔离） | 不可交互，纯执行 | Planner, Coder, Reviewer, QA, UI Test |

### 为什么混合？

- **纯 Skill 问题**：Reviewer 能看到 Coder 的推理过程 → 审查不独立；上下文膨胀
- **纯 Subagent 问题**：Analyst 无法向用户提问；Ship 无法展示部署进度
- **混合方案**：按角色需求选择机制，兼顾隔离性和交互性

### 角色分配

| 角色 | 机制 | 原因 |
|------|------|------|
| Analyst | Skill | 需要与用户交互澄清需求 |
| Planner | Subagent | 纯输出，与 Analyst 思维隔离 |
| Coder | Subagent | 长任务，独立上下文 |
| Reviewer | Subagent | **关键隔离点** — 不能看到 Coder 过程 |
| QA | Subagent | 纯执行，独立测试 |
| UI Test | Subagent | Playwright 自动化 |
| Ship | Skill | 展示进度，处理部署失败 |
| Orchestrator (dev) | Skill | 管理流程，处理人工审批 |

## 通信机制：文件驱动

角色之间通过**文件**通信，不通过上下文传递：

```
Analyst  → .ai/artifacts/prd/feature-{xxx}.md
  ↓
Planner  → .ai/artifacts/design/feature-{xxx}.md
  ↓        .ai/artifacts/test-plan/feature-{xxx}.md
Coder    → Git commits
  ↓
Reviewer → .ai/artifacts/review/feature-{xxx}.md
  ↓
QA       → .ai/artifacts/bug-report/BUG-*.md
  ↓
UI Test  → .ai/artifacts/ui-test/feature-{xxx}.md
```

**优点**：可追溯、可恢复、可审计、Git 管理。

## 复杂度自适应

Analyst 评估需求复杂度（S/M/L），影响后续流程：

| 复杂度 | Planner | Coder | Reviewer | QA | UI Test | Ship |
|--------|---------|-------|----------|-----|---------|------|
| S | ⏭️ 跳过 | ✅ 直接读 PRD | ✅ | ✅ | 按 scope | ✅ |
| M/L | ✅ | ✅ 读设计文档 | ✅ | ✅ | 按 scope | ✅ |

## 反馈回环

每个验证阶段支持最多 2 轮自动修复：

```
Reviewer REQUEST CHANGES → Coder 修复 → Reviewer 重审（最多 2 轮）
QA 测试失败 → Coder 修 Bug → QA 重测（最多 2 轮）
UI Test 发现问题 → 主会话修复 → UI Test 重测（最多 2 轮）
```

超过 2 轮 → 暂停，等待人工决策。

## 人工审批点

| 审批点 | 位置 | 原因 |
|--------|------|------|
| PRD 审批 | Analyst 之后 | 错误需求浪费所有后续工作 |
| 设计审批 | Planner 之后（M/L） | 设计选择需要人类判断 |
| 修复决策 | 2 轮反馈后 | 持续问题需要人工介入 |

## 变更范围自动检测

Coder 完成后，通过 `git diff --name-only` 检测实际变更文件，根据 `project.yml` 中的 `file_classification` 规则判断：

- **backend-only** → 跳过 UI Test
- **has-frontend** → 执行 UI Test

## 项目适配

所有项目特定信息集中在 `.ai/project.yml`：

- 构建/测试命令
- 目录结构
- 编码规范
- 部署方式
- 文件分类规则

角色 prompt 通过引用 `project.yml` 和 `coding-standards.md` 获取项目上下文，自身保持通用。

## 制品目录

```
.ai/artifacts/
├── prd/           # 产品需求文档
├── design/        # 技术设计文档
├── test-plan/     # 测试计划 + 执行报告
├── review/        # 代码审查报告
├── bug-report/    # Bug 报告
├── ui-test/       # UI 测试报告
└── logs/          # 流水线执行日志
```
