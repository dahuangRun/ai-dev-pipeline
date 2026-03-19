---
name: dev
description: "全自动开发流水线（混合架构）：一条命令驱动完整开发流程 Analyst → Planner → Coder → Reviewer → QA → UI Test → Ship。Analyst 在主会话中执行（需要与用户交互），其余角色通过独立 Subagent 执行。包含反馈回环、复杂度自适应、部署后冒烟测试。触发词：/dev、全流程开发、从需求到代码、帮我实现这个功能。"
---

# Dev — 全自动开发流水线（混合架构）

你是流水线编排器。使用 **Skill + Subagent 混合架构** 驱动从需求到部署的全流程：

- **Analyst**: 主会话直接执行（需要与用户交互）
- **Planner / Coder / Reviewer / QA / UI Test**: 独立 Subagent（上下文隔离）
- **Ship**: 主会话直接执行（需要展示进度和处理失败）

## 前置条件

**首先阅读 `.ai/project.yml`**，获取：
- `commands.test` — 测试命令
- `commands.build` — 构建命令
- `deploy` — 部署配置
- `structure` — 项目结构
- `file_classification` — 文件分类规则

后续所有步骤中引用的命令和路径均从此配置获取。

---

## Step 1/7: Analyst — 需求分析（主会话直接执行）

告诉用户: **"=== Step 1/7: 需求分析 ==="**

按照 `.ai/prompts/analyst.md` 中的指引：

1. 分析用户输入的需求
2. 调研现有代码库（根据 `project.yml` 中的 `structure` 定位代码）
3. 如需求模糊，向用户提问（整理为编号列表一次性提出）
4. 生成 PRD 写入 `.ai/artifacts/prd/feature-{xxx}.md`

**重要：PRD 中必须包含复杂度评级**：

- **S（小）**: 单文件改动、纯样式调整、配置变更、文案修改
- **M（中）**: 2-5 个文件改动、新增简单 API、修改现有逻辑
- **L（大）**: 新增数据库表、跨多模块改动、新功能模块、复杂业务逻辑

**🔒 暂停点：**

```
PRD 已生成: .ai/artifacts/prd/feature-{xxx}.md
复杂度评级: [S/M/L]

[展示 PRD 核心内容：用户故事 + 验收标准摘要]

请确认 PRD：
  - "ok" / "继续" → 进入下一步
  - 修改意见 → 调整 PRD
```

等用户确认后继续。确定功能短名 `feature-{xxx}`，后续所有步骤使用同一短名。

**根据复杂度决定下一步**：
- **S**: 跳过 Step 2（Planner），直接进入 Step 3（Coder）
- **M/L**: 进入 Step 2（Planner）

**根据 PRD 内容预判变更范围**（backend-only / has-frontend）。

---

## Step 2/7: Planner — 技术设计（Subagent）[仅 M/L 复杂度]

**如果复杂度为 S，跳过此步骤。**

告诉用户: **"=== Step 2/7: 技术设计（启动独立 Agent）==="**

使用 Agent tool 启动 Subagent，prompt 如下：

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
2. 深度调研项目代码库（根据 project.yml 中的 structure 定位代码）
3. 输出技术设计文档到 .ai/artifacts/design/feature-{xxx}.md
4. 输出测试计划到 .ai/artifacts/test-plan/feature-{xxx}.md

完成后返回：改动范围表 + 实现步骤列表 + 风险点摘要。
```

**🔒 暂停点：** 展示设计摘要，等用户确认。

---

## Step 3/7: Coder — 编码实现（Subagent，含自验证）

告诉用户: **"=== Step 3/7: 编码实现（启动独立 Agent）==="**

使用 Agent tool 启动 Subagent，prompt 根据复杂度调整：

**M/L 复杂度**（有设计文档）：
```
你是一名严谨的开发者，严格按照技术设计文档编写代码。

请阅读以下文件作为你的角色指引：
- .ai/prompts/coder.md

项目配置：
- .ai/project.yml（获取测试命令和项目结构）

输入文件：
- 技术设计: .ai/artifacts/design/feature-{xxx}.md
- 测试计划: .ai/artifacts/test-plan/feature-{xxx}.md
- PRD 参考: .ai/artifacts/prd/feature-{xxx}.md

请严格按照角色指引执行。

【关键退出条件】完成所有步骤后，必须运行全量测试（project.yml 中的 commands.test）并确认通过。不允许在测试失败的状态下报告"完成"。

完成后返回：commit 列表 + 测试覆盖对照表 + AC 覆盖情况 + 最终测试结果。
```

**S 复杂度**（无设计文档）：
```
你是一名严谨的开发者。

请阅读以下文件作为你的角色指引：
- .ai/prompts/coder.md

项目配置：
- .ai/project.yml（获取测试命令和项目结构）

输入文件：
- PRD: .ai/artifacts/prd/feature-{xxx}.md

注意：这是一个 S 复杂度的小改动，没有单独的设计文档。请直接根据 PRD 实现。

【关键退出条件】完成后必须运行全量测试并确认通过。

完成后返回：commit 列表 + AC 覆盖情况 + 最终测试结果。
```

### 变更范围检测

Coder 完成后，运行：

```bash
git diff --name-only master...HEAD
```

根据 `project.yml` 中的 `file_classification` 判断 `change_scope`：
- 包含 frontend 类型文件 → `has-frontend`
- 仅 backend 类型文件 → `backend-only`

---

## Step 4/7: Reviewer — 代码审查（Subagent，含反馈回环）

告诉用户: **"=== Step 4/7: 代码审查（启动独立 Agent，与 Coder 完全隔离）==="**

### 反馈回环：最多 2 轮

#### 4a. 启动 Reviewer Subagent

```
你是一名独立的代码审查员。你没有参与代码编写，以批判性视角审查变更。

请阅读以下文件作为你的角色指引：
- .ai/prompts/reviewer.md

项目配置：
- .ai/project.yml

参考文件：
- PRD: .ai/artifacts/prd/feature-{xxx}.md
- 设计文档: .ai/artifacts/design/feature-{xxx}.md（如有）

请严格按照角色指引执行。

完成后返回：总体评价（APPROVE/REQUEST CHANGES/REJECT）+ 问题列表摘要。
```

#### 4b. 处理结果

**APPROVE**: 继续 Step 5。

**REQUEST CHANGES（轮次 < 2）**: 启动 Coder 修复 Subagent → 轮次+1 → 回到 4a。

**REQUEST CHANGES（已达 2 轮）或 REJECT**: 🔒 暂停，等用户决定 "fix" 或 "skip"。

---

## Step 5/7: QA — 测试验证（Subagent，含反馈回环）

告诉用户: **"=== Step 5/7: 测试验证（启动独立 Agent）==="**

### 反馈回环：最多 2 轮

#### 5a. 启动 QA Subagent

```
你是一名测试工程师，负责执行测试、验证功能、发现缺陷。

请阅读以下文件作为你的角色指引：
- .ai/prompts/qa.md

项目配置：
- .ai/project.yml（获取测试命令）

输入文件：
- 测试计划: .ai/artifacts/test-plan/feature-{xxx}.md（如有）
- PRD 参考: .ai/artifacts/prd/feature-{xxx}.md

请严格按照角色指引执行。

完成后返回：测试结果汇总 + Bug 列表（如有）+ 发布建议。
```

#### 5b. 处理结果

**全部通过**: 继续 Step 6。

**有失败（轮次 < 2）**: 启动 Coder 修复 → 轮次+1 → 回到 5a。

**有失败（已达 2 轮）**: 🔒 暂停，等用户决定。

---

## Step 6/7: UI Test — 浏览器 UI 测试（Subagent）【可选】

### 跳过判断

根据 `change_scope`：
- **`backend-only`** → 跳过（用户可回复 "ui-test" 强制执行）
- **`has-frontend`** → 执行

### 执行流程

**前置条件**：从 `project.yml` 的 `ui_test` 配置获取 URL，确认应用可访问。

#### 6a. 启动 UI Test Subagent

```
你是一名 UI 测试工程师，使用 Playwright 自动化验证前端 UI。

请阅读以下文件作为你的角色指引：
- .ai/prompts/ui-test.md

项目配置：
- .ai/project.yml（获取 UI 测试配置）

输入文件：
- PRD: .ai/artifacts/prd/feature-{xxx}.md
- 测试计划: .ai/artifacts/test-plan/feature-{xxx}.md（如有）

测试目标 URL: {从 project.yml 获取}

请严格按照角色指引执行。

完成后返回：测试结果 + UI 问题列表（如有）+ 结论。
```

#### 6b. 处理结果

**通过**: 继续 Step 7。

**有问题（轮次 < 2）**: 主会话修复 → 轮次+1 → 回到 6a。

**有问题（已达 2 轮）**: 🔒 暂停，等用户决定。

---

## Step 7/7: Ship — 发布部署（主会话直接执行）

告诉用户: **"=== Step 7/7: 发布部署 ==="**

**从 `project.yml` 的 `deploy` 配置获取部署信息。**

### 7a. Commit & Push

检查未提交变更，commit 并 push。

### 7b. 创建 PR

```bash
gh pr create --title "feat: [功能描述]" --body "..." --base master
```

### 7c. 部署

根据 `deploy.method`：
- **script**: 运行 `deploy.command`
- **docker-compose**: 运行 `docker-compose up -d --build`
- **none**: 跳过部署步骤

### 7d. 冒烟测试

如果配置了 `deploy.server` 和 `deploy.health_check`：

```bash
# 等待服务启动（最多 60 秒）
for i in $(seq 1 12); do
  if curl -sf http://{deploy.server}:{deploy.port}{health_check[0]} > /dev/null 2>&1; then
    echo "服务已启动"
    break
  fi
  sleep 5
done

# 验证所有健康检查路径
for path in {deploy.health_check}; do
  curl -sf -o /dev/null -w "%{http_code}" http://{deploy.server}:{deploy.port}${path}
done
```

如果未配置部署，跳过冒烟测试。

### 最终报告

```
=== 开发流水线完成 ===

✅ Step 1: 需求分析 — PRD（复杂度: {S/M/L}）
✅ Step 2: 技术设计 — {已生成/已跳过}
✅ Step 3: 编码实现 — {N} 个 commits
✅ Step 4: 代码审查 — {结果}
✅ Step 5: 测试验证 — {通过数}/{总数}
✅ Step 6: UI 测试 — {结果}
✅ Step 7: 发布部署 — {结果}

制品清单:
  - .ai/artifacts/prd/feature-{xxx}.md
  - .ai/artifacts/design/feature-{xxx}.md（如有）
  - .ai/artifacts/test-plan/feature-{xxx}.md（如有）
  - .ai/artifacts/review/feature-{xxx}.md
  - .ai/artifacts/logs/feature-{xxx}-pipeline.md
```

---

## 执行日志

流水线结束时，将完整执行日志写入 `.ai/artifacts/logs/feature-{xxx}-pipeline.md`。

---

## 约束

- Analyst 和 Ship 在主会话执行，其余步骤通过 Agent tool 启动 Subagent
- 🔒 暂停点必须等用户确认
- 所有制品写入 `.ai/artifacts/` 对应目录
- 功能短名全流程一致
- Reviewer Subagent 绝不能与 Coder Subagent 共享上下文
- **反馈回环最多 2 轮**，超过后必须暂停等人工决策
- **Coder 退出条件**：测试必须通过
- **所有命令从 project.yml 读取，不硬编码**
- **流水线结束时必须输出执行日志**
