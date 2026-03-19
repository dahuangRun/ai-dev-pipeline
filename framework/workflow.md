# AI 开发流水线 — 使用指南

## 快速开始

### 1. 安装

在你的项目根目录执行：

```bash
npx ai-dev-pipeline init
```

CLI 会自动检测你使用的 AI 编码工具（Claude Code / Cursor / CodeBuddy / Codex），并安装对应格式的技能文件。也可以手动指定：

```bash
npx ai-dev-pipeline init --tool cursor
```

### 2. 初始化配置

在你的 AI 编码工具中执行 init-pipeline 指令：

- **Claude Code**: 运行 `/init-pipeline`
- **Cursor / 其他工具**: 告诉 AI "阅读 init-pipeline 技能文件并执行"

AI 会自动扫描项目，识别技术栈、目录结构、构建命令，生成配置文件。你只需确认结果。

### 3. 开始使用

```
/dev "你的需求描述"
```

## 可用命令

### 全流程

| 命令 | 说明 |
|------|------|
| `/dev "需求"` | 全自动流水线：需求 → 设计 → 编码 → 审查 → 测试 → 部署 |

### 分步执行

| 命令 | 说明 |
|------|------|
| `/analyst "需求"` | 仅需求分析，生成 PRD |
| `/planner feature-xxx` | 仅技术设计 |
| `/coder feature-xxx` | 仅编码实现 |
| `/reviewer` | 仅代码审查 |
| `/qa` | 仅运行测试 |
| `/ui-test` | 仅 UI 自动化测试 |
| `/ship` | 仅发布部署 |

### 配置管理

| 命令 | 说明 |
|------|------|
| `/init-pipeline` | 自动扫描项目，生成配置 |

## 配置文件

### `.ai/project.yml`

项目适配的核心配置文件。包含：
- 技术栈信息
- 构建/测试命令
- 目录结构
- 部署配置
- UI 测试配置

### `.ai/coding-standards.md`

项目编码规范。由 `/init-pipeline` 从现有代码中归纳生成，可手动调整。

### `.ai/prompts/*.md`

角色 Prompt 文件。通常不需要修改，除非你想自定义某个角色的行为。

## 典型工作流

### 全自动模式

```
用户: /dev "添加用户导出功能"

→ Step 1: Analyst 分析需求，生成 PRD（复杂度: M）
  🔒 用户确认 PRD

→ Step 2: Planner 生成设计文档 + 测试计划
  🔒 用户确认设计

→ Step 3: Coder 按设计文档实现（先测试后代码）
→ Step 4: Reviewer 独立审查 → 自动修复（最多 2 轮）
→ Step 5: QA 运行测试 → 自动修 Bug（最多 2 轮）
→ Step 6: UI Test（如有前端变更）→ 自动修复
→ Step 7: Ship → commit + PR + deploy + 冒烟测试
```

### 分步模式

适合需要更细粒度控制的场景：

```bash
/analyst "需求描述"     # 生成 PRD，确认后
/planner feature-xxx    # 生成设计，确认后
/coder feature-xxx      # 编码实现
/reviewer               # 代码审查
/qa                     # 测试验证
/ship                   # 发布
```

## 自定义

### 修改编码规范

编辑 `.ai/coding-standards.md`，所有角色会自动读取。

### 修改角色行为

编辑 `.ai/prompts/` 下对应的 prompt 文件。

### 调整流水线步骤

编辑 `.claude/skills/dev/SKILL.md` 中的编排逻辑。

### 添加新角色

1. 在 `.ai/prompts/` 创建角色 prompt
2. 在 `.claude/skills/` 创建对应 skill
3. 在 `dev/SKILL.md` 中添加新步骤
