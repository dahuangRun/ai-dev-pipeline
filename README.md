# AI Dev Pipeline

AI 驱动的全自动开发流水线框架，支持多种 AI 编码工具。

**一条命令，从需求到部署。**

```
/dev "添加用户导出功能"
```

自动执行：需求分析 → 技术设计 → 编码实现 → 代码审查 → 测试验证 → UI 测试 → 发布部署

## 特性

- **AI 工具无关**：支持 Claude Code / CodeBuddy / Cursor / Codex 等，自动检测适配
- **原生斜杠命令**：安装后直接在 AI 工具中使用 `/dev`、`/analyst`、`/ship` 等命令
- **技术栈无关**：通过 `project.yml` 适配任意项目（Java/Python/Go/TypeScript/Rust/...）
- **自动扫描**：`/init-pipeline` 自动识别技术栈、目录结构、构建命令，无需手动配置
- **多角色协作**：6 个 AI 角色分工明确，Reviewer 与 Coder 完全隔离
- **反馈回环**：审查/测试发现问题自动修复（最多 2 轮），超限人工介入
- **复杂度自适应**：S 级需求跳过设计阶段，直接编码
- **全程可观测**：所有制品 Git 管理，执行日志完整记录

## 支持的 AI 工具

| 工具 | 技能安装位置 | 斜杠命令 |
|------|------------|---------|
| Claude Code | `.claude/skills/` | `/dev "需求"` `/analyst` `/ship` 等 |
| CodeBuddy | `.codebuddy/skills/` | `/dev "需求"` `/analyst` `/ship` 等 |
| Cursor | `.cursor/rules/` | 告诉 AI "按照 dev 技能执行" |
| Codex | `.codex/` | 告诉 AI "按照 dev 技能执行" |
| 其他工具 | `.ai/instructions/` | 告诉 AI "阅读 .ai/instructions/dev.md 并执行" |

Claude Code 和 CodeBuddy 均采用 `skills/<name>/SKILL.md` 目录结构，安装后所有技能自动注册为原生斜杠命令。

## 快速开始

### 1. 安装到项目

在你的项目根目录执行：

```bash
# 自动检测 AI 工具
npx ai-dev-pipeline init

# 或指定工具
npx ai-dev-pipeline init --tool claude-code
npx ai-dev-pipeline init --tool codebuddy
```

### 2. 自动初始化配置

在 AI 工具中执行：

```
/init-pipeline
```

AI 自动扫描项目，识别技术栈、目录结构、构建命令，生成配置文件。你只需确认。

### 3. 开始使用

```
/dev "你的需求描述"
```

## 斜杠命令

安装后，以下命令在 Claude Code 和 CodeBuddy 中可直接使用：

### 全流程

| 命令 | 说明 |
|------|------|
| `/dev "需求描述"` | 全自动流水线：需求 → 设计 → 编码 → 审查 → 测试 → 部署 |

### 分步执行

| 命令 | 说明 |
|------|------|
| `/analyst "需求描述"` | 需求分析，生成 PRD |
| `/planner` | 技术设计 + 测试计划 |
| `/coder` | 编码实现 |
| `/reviewer` | 独立代码审查 |
| `/qa` | 测试验证 |
| `/ui-test` | UI 浏览器测试 |
| `/ship` | 发布部署 |

### 配置

| 命令 | 说明 |
|------|------|
| `/init-pipeline` | 自动扫描项目，生成配置 |

## CLI 命令

CLI 仅用于安装和管理框架：

| 命令 | 说明 |
|------|------|
| `ai-dev-pipeline init` | 安装流水线框架到当前项目 |
| `ai-dev-pipeline init --tool <tool>` | 指定 AI 工具安装 |
| `ai-dev-pipeline update` | 更新 Prompt 和技能（保留项目配置） |
| `ai-dev-pipeline doctor` | 检查配置完整性 |

## 流水线架构

```
/dev "需求"
  │
  ├─ Step 1: Analyst — 需求分析，与用户交互
  │    🔒 人工审批 PRD
  │
  ├─ Step 2: Planner — 技术设计 [仅 M/L 复杂度]
  │    🔒 人工审批设计
  │
  ├─ Step 3: Coder — 编码实现（TDD，先测试后代码）
  │
  ├─ Step 4: Reviewer — 独立审查 ← 反馈回环 (≤2轮)
  │
  ├─ Step 5: QA — 测试验证 ← 反馈回环 (≤2轮)
  │
  ├─ Step 6: UI Test — 浏览器测试 [前端变更时自动触发]
  │
  └─ Step 7: Ship — 提交/PR/部署 + 冒烟测试
```

### 角色分工

| 角色 | 执行方式 | 职责 |
|------|---------|------|
| Analyst | 主会话（需交互） | 分析需求，生成 PRD，评估复杂度 S/M/L |
| Planner | 独立 Subagent | 技术设计文档 + 测试计划（M/L 复杂度） |
| Coder | 独立 Subagent | TDD 编码，先写测试后实现，小步提交 |
| Reviewer | 独立 Subagent | 独立代码审查（与 Coder 上下文隔离） |
| QA | 独立 Subagent | 执行测试，回归分析，生成 Bug 报告 |
| UI Test | 独立 Subagent | Playwright 自动化浏览器测试 |
| Ship | 主会话（需交互） | 提交、创建 PR、部署、冒烟测试 |

## 项目配置

安装后的文件结构：

```
.ai/
├── project.yml           # 项目适配配置（唯一需要关注的文件）
├── coding-standards.md   # 编码规范（自动生成，可调整）
├── architecture.md       # 流水线架构文档
├── workflow.md           # 使用指南
├── prompts/              # 角色 Prompt（通用，与 AI 工具无关）
│   ├── analyst.md
│   ├── planner.md
│   ├── coder.md
│   ├── reviewer.md
│   ├── qa.md
│   └── ui-test.md
└── artifacts/            # 制品输出（自动生成）

# 技能文件（位置取决于 AI 工具，安装后自动成为斜杠命令）
.claude/skills/           # Claude Code
.codebuddy/skills/        # CodeBuddy
.cursor/rules/            # Cursor
.ai/instructions/         # 通用
```

### `project.yml` 示例

```yaml
project:
  name: "my-app"
  language: java
  framework: spring-boot

commands:
  build: "./gradlew clean build -x test"
  test: "./gradlew test"
  dev: "./gradlew bootRun"

structure:
  backend:
    root: "src/main/java/com/example/app"
    layers:
      entity: "entity/"
      service: "service/"
      controller: "controller/"

deploy:
  method: script
  command: "sh deploy.sh"
  server: "192.168.1.100"
  port: 8080
  health_check: ["/api/health"]
```

## 支持的技术栈

| 语言 | 框架 | 构建工具 |
|------|------|---------|
| Java | Spring Boot, Micronaut, Quarkus | Gradle, Maven |
| TypeScript/JS | Next.js, Nuxt, Vue, React, Express | npm, pnpm, yarn |
| Python | Django, Flask, FastAPI | pip, poetry |
| Go | Gin, Echo, Fiber, 标准库 | go build |
| Rust | Actix, Axum, Rocket | Cargo |
| Ruby | Rails, Sinatra | Bundler |
| C# | ASP.NET, Blazor | dotnet |
| PHP | Laravel, Symfony | Composer |

## 自定义

### 修改编码规范

编辑 `.ai/coding-standards.md`，所有角色自动读取。

### 修改角色行为

编辑 `.ai/prompts/` 下对应的 prompt 文件。

### 调整流水线

编辑技能文件中 `dev` 的编排逻辑。

### 更新框架

```bash
ai-dev-pipeline update
```

更新 prompt 和技能，不覆盖 `project.yml` 和 `coding-standards.md`。

## 内网部署

如果你的环境无法访问 GitHub / npm，有两种方式可用：

### 方案一：离线 tgz 包（最简单）

```bash
# === 有网环境：打包 ===
git clone https://github.com/dahuangRun/ai-dev-pipeline.git
cd ai-dev-pipeline
npm pack
# 产出 ai-dev-pipeline-2.0.0.tgz

# === 拷贝到内网后 ===

# 全局安装
npm install -g /shared/tools/ai-dev-pipeline-2.0.0.tgz
ai-dev-pipeline init

# 或 npx 一次性运行
npx /shared/tools/ai-dev-pipeline-2.0.0.tgz init
```

### 方案二：内网 Git 仓库（团队推荐）

```bash
# === 管理员：推送到内网 GitLab/Gitea ===
git clone https://github.com/dahuangRun/ai-dev-pipeline.git
cd ai-dev-pipeline
git remote add internal http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git
git push internal master

# === 开发者：安装使用 ===
npm install -g git+http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git
ai-dev-pipeline init --tool codebuddy
```

> 详细说明见 [内网部署完整指南](docs/internal-deploy.md)

## 设计原则

- **文件驱动通信**：角色之间通过 `.ai/artifacts/` 文件传递信息，不共享上下文
- **关键隔离**：Reviewer 与 Coder 在独立上下文中运行，审查不受编码过程影响
- **人工审批点**：需求确认、设计确认、超限修复 — 关键决策留给人
- **最多 2 轮自动修复**：防止无限循环，超限升级到人工
- **全程可追溯**：每个制品 Git 管理，执行日志完整记录
- **工具无关**：核心 Prompt 与 AI 工具解耦，通过适配器层对接不同工具
