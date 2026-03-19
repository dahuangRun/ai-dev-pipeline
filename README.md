# Claude Dev Pipeline

AI 驱动的全自动开发流水线框架，基于 Claude Code 的 Skill + Subagent 混合架构。

**一条命令，从需求到部署。**

```
/dev "添加用户导出功能"
```

自动执行：需求分析 → 技术设计 → 编码实现 → 代码审查 → 测试验证 → UI 测试 → 发布部署

## 特性

- **技术栈无关**：通过 `project.yml` 适配任意项目（Java/Python/Go/TypeScript/Rust/...）
- **自动扫描**：`/init-pipeline` 自动识别技术栈、目录结构、构建命令，无需手动配置
- **混合架构**：Skill（交互）+ Subagent（隔离），Reviewer 与 Coder 完全独立
- **反馈回环**：审查/测试发现问题自动修复（最多 2 轮），超限人工介入
- **复杂度自适应**：S 级需求跳过设计阶段，直接编码
- **全程可观测**：所有制品 Git 管理，执行日志完整记录

## 快速开始

### 1. 安装到项目

在你的项目根目录执行：

```bash
npx claude-dev-pipeline init
```

### 2. 自动初始化配置

在 Claude Code 中打开项目，运行：

```
/init-pipeline
```

AI 自动扫描项目，识别技术栈、目录结构、构建命令，生成配置文件。你只需确认。

### 3. 开始使用

```
/dev "你的需求描述"
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `/init-pipeline` | 自动扫描项目，生成配置 |
| `/dev "需求"` | 全自动流水线（7 步） |
| `/analyst "需求"` | 仅需求分析，生成 PRD |
| `/planner feature-xxx` | 仅技术设计 |
| `/coder feature-xxx` | 仅编码实现 |
| `/reviewer` | 仅代码审查 |
| `/qa` | 仅测试验证 |
| `/ui-test` | 仅 UI 测试 |
| `/ship` | 仅发布部署 |

## 流水线架构

```
/dev "需求"
  │
  ├─ Step 1: Analyst (Skill) — 需求分析，与用户交互
  │    🔒 人工审批 PRD
  │
  ├─ Step 2: Planner (Subagent) — 技术设计 [仅 M/L]
  │    🔒 人工审批设计
  │
  ├─ Step 3: Coder (Subagent) — 编码实现
  │
  ├─ Step 4: Reviewer (Subagent) — 独立审查 ← 反馈回环 (≤2轮)
  │
  ├─ Step 5: QA (Subagent) — 测试验证 ← 反馈回环 (≤2轮)
  │
  ├─ Step 6: UI Test (Subagent) — 浏览器测试 [可选]
  │
  └─ Step 7: Ship (Skill) — 发布部署 + 冒烟测试
```

## 项目配置

安装后的核心配置文件：

```
.ai/
├── project.yml           # 项目适配配置（唯一需要关注的文件）
├── coding-standards.md   # 编码规范（自动生成，可调整）
├── architecture.md       # 流水线架构文档
├── workflow.md           # 使用指南
├── prompts/              # 角色 Prompt（通常不需要改）
│   ├── analyst.md
│   ├── planner.md
│   ├── coder.md
│   ├── reviewer.md
│   ├── qa.md
│   └── ui-test.md
└── artifacts/            # 制品输出（自动生成）
    ├── prd/
    ├── design/
    ├── test-plan/
    ├── review/
    ├── bug-report/
    ├── ui-test/
    └── logs/

.claude/skills/           # Skill 定义（通常不需要改）
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

编辑 `.claude/skills/dev/SKILL.md` 中的编排逻辑。

### 更新框架

重新运行安装脚本，会更新 prompt 和 skill，不覆盖 `project.yml`。

## 内网部署

如果你的环境无法访问 GitHub / npm，有两种方式可用：

### 方案一：离线 tgz 包（最简单）

```bash
# === 有网环境：打包 ===
git clone https://github.com/dahuangRun/claude-dev-pipeline.git
cd claude-dev-pipeline
npm pack
# 产出 claude-dev-pipeline-1.0.0.tgz

# === 拷贝到内网后 ===

# 全局安装（推荐，多次使用更方便）
npm install -g /shared/tools/claude-dev-pipeline-1.0.0.tgz
claude-dev-pipeline init

# 或 npx 一次性运行（不安装）
npx /shared/tools/claude-dev-pipeline-1.0.0.tgz init

# 或作为项目 devDependency
npm install --save-dev /shared/tools/claude-dev-pipeline-1.0.0.tgz
npx claude-dev-pipeline init
```

更新时重新打包、拷贝、安装即可。

### 方案二：内网 Git 仓库（团队推荐）

```bash
# === 管理员：首次推送到内网 GitLab/Gitea ===
git clone https://github.com/dahuangRun/claude-dev-pipeline.git
cd claude-dev-pipeline
git remote add internal http://gitlab.yourcompany.com/devtools/claude-dev-pipeline.git
git push internal master

# === 管理员：定期同步上游更新 ===
git pull origin master
git push internal master

# === 开发者：安装使用 ===

# 全局安装
npm install -g git+http://gitlab.yourcompany.com/devtools/claude-dev-pipeline.git
claude-dev-pipeline init

# 或克隆后 link（更新只需 git pull）
git clone http://gitlab.yourcompany.com/devtools/claude-dev-pipeline.git ~/tools/cdp
cd ~/tools/cdp && npm link
claude-dev-pipeline init
```

### 方案对比

| | 离线 tgz | 内网 Git |
|---|---|---|
| 前置条件 | 只需 Node.js | 需要内网 Git 服务 |
| 更新方式 | 重新打包 + 拷贝 | `git pull` + `git push` |
| 适合场景 | 个人使用、临时环境 | 团队长期使用 |

> 详细说明见 [内网部署完整指南](docs/internal-deploy.md)

## 设计原则

- **文件驱动通信**：角色之间通过 `.ai/artifacts/` 文件传递信息，不共享上下文
- **关键隔离**：Reviewer 与 Coder 在独立 Subagent 中运行，审查不受编码过程影响
- **人工审批点**：需求确认、设计确认、超限修复 — 关键决策留给人
- **最多 2 轮自动修复**：防止无限循环，超限升级到人工
- **全程可追溯**：每个制品 Git 管理，执行日志完整记录
