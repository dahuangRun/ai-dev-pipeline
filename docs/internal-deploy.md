# 内网部署指南

适用于无法访问 GitHub / npm 公网 registry 的内网环境。

---

## 方案一：离线 tgz 包安装

最简单的方式，无需任何内网基础设施。在有网的机器上打包一次，拷贝到内网使用。

### 1. 打包（有网环境，一次性操作）

```bash
# 克隆项目
git clone https://github.com/dahuangRun/ai-dev-pipeline.git
cd ai-dev-pipeline

# 打包为 tgz
npm pack

# 产出文件：ai-dev-pipeline-1.0.0.tgz
```

### 2. 拷贝到内网

将 `ai-dev-pipeline-1.0.0.tgz` 通过 U 盘、内网文件共享、scp 等方式传到内网机器。

建议放在团队共享目录，例如：

```
/shared/tools/ai-dev-pipeline-1.0.0.tgz
```

### 3. 安装使用

#### 方式 A：npx 直接运行（不安装，一次性）

```bash
# 进入你的项目目录
cd /path/to/your/project

# 直接从 tgz 运行
npx /shared/tools/ai-dev-pipeline-1.0.0.tgz init
```

#### 方式 B：全局安装（推荐，多次使用更方便）

```bash
# 全局安装
npm install -g /shared/tools/ai-dev-pipeline-1.0.0.tgz

# 之后在任意项目中直接使用
cd /path/to/your/project
ai-dev-pipeline init

# 其他命令同样可用
ai-dev-pipeline update
ai-dev-pipeline doctor
```

#### 方式 C：项目级安装（作为 devDependency）

```bash
cd /path/to/your/project

# 安装为开发依赖
npm install --save-dev /shared/tools/ai-dev-pipeline-1.0.0.tgz

# 通过 npx 使用
npx ai-dev-pipeline init
```

### 4. 更新版本

当框架有新版本时：

```bash
# 有网环境重新打包
cd ai-dev-pipeline
git pull
npm pack
# 产出新的 tgz，如 ai-dev-pipeline-1.1.0.tgz

# 拷贝到内网，重新安装
npm install -g /shared/tools/ai-dev-pipeline-1.1.0.tgz

# 在已安装的项目中更新
cd /path/to/your/project
ai-dev-pipeline update
```

### 完整示例

```bash
# === 有网环境 ===
git clone https://github.com/dahuangRun/ai-dev-pipeline.git
cd ai-dev-pipeline
npm pack
scp ai-dev-pipeline-1.0.0.tgz user@internal-server:/shared/tools/

# === 内网环境 ===
npm install -g /shared/tools/ai-dev-pipeline-1.0.0.tgz

# 项目 A：Spring Boot
cd /projects/user-service
ai-dev-pipeline init
# 然后在 AI 编码工具中运行 init-pipeline

# 项目 B：Next.js
cd /projects/web-frontend
ai-dev-pipeline init
# 然后在 AI 编码工具中运行 init-pipeline

# 项目 C：Go 微服务
cd /projects/order-api
ai-dev-pipeline init
# 然后在 AI 编码工具中运行 init-pipeline
```

---

## 方案二：内网 Git 仓库安装

适用于团队有内网 GitLab / Gitea / Gitbucket 等 Git 服务的场景。多人协作更方便，版本管理更清晰。

### 1. 推送到内网 Git（一次性操作）

```bash
# 有网环境：克隆项目
git clone https://github.com/dahuangRun/ai-dev-pipeline.git
cd ai-dev-pipeline

# 添加内网 remote
git remote add internal http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git
# 或 Gitea
# git remote add internal http://gitea.yourcompany.com/devtools/ai-dev-pipeline.git

# 推送到内网
git push internal master
```

如果内网 Git 使用 SSH：

```bash
git remote add internal git@gitlab.yourcompany.com:devtools/ai-dev-pipeline.git
git push internal master
```

### 2. 安装使用

#### 方式 A：npx 从 Git 安装（推荐）

```bash
cd /path/to/your/project

# HTTP 方式
npx git+http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git init

# SSH 方式
npx git+ssh://git@gitlab.yourcompany.com/devtools/ai-dev-pipeline.git init
```

#### 方式 B：全局安装

```bash
# HTTP
npm install -g git+http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git

# SSH
npm install -g git+ssh://git@gitlab.yourcompany.com/devtools/ai-dev-pipeline.git

# 之后直接使用
cd /path/to/your/project
ai-dev-pipeline init
```

#### 方式 C：克隆后本地安装

```bash
# 克隆到本地
git clone http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git ~/tools/ai-dev-pipeline

# 全局 link
cd ~/tools/ai-dev-pipeline
npm link

# 在任意项目中使用
cd /path/to/your/project
ai-dev-pipeline init
```

这种方式的好处是更新时只需 `git pull`，不用重新安装：

```bash
cd ~/tools/ai-dev-pipeline
git pull
# link 是符号链接，自动生效
```

### 3. 同步上游更新

定期从 GitHub 同步最新版本到内网：

```bash
cd ai-dev-pipeline

# 从 GitHub 拉取最新
git pull origin master

# 推送到内网
git push internal master
```

可以配置 CI 自动同步，或写一个简单脚本：

```bash
#!/bin/bash
# sync-upstream.sh — 同步上游更新到内网 Git
cd /path/to/ai-dev-pipeline
git fetch origin
git merge origin/master --ff-only
git push internal master
echo "同步完成: $(git log --oneline -1)"
```

### 4. 团队使用

团队成员只需知道内网 Git 地址：

```bash
# 新项目初始化
cd my-new-project
npx git+http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git init

# 在 AI 编码工具中
/init-pipeline    # AI 自动扫描项目
/dev "需求描述"    # 全自动开发
```

### 完整示例

```bash
# === 管理员：首次设置 ===
# 在 GitLab 创建项目: devtools/ai-dev-pipeline

git clone https://github.com/dahuangRun/ai-dev-pipeline.git
cd ai-dev-pipeline
git remote add internal http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git
git push internal master

# === 管理员：定期同步 ===
git pull origin master
git push internal master

# === 开发者：使用 ===
npm install -g git+http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git

cd /projects/my-service
ai-dev-pipeline init
# 打开 AI 编码工具 → 运行 init-pipeline → dev "需求"

# === 开发者：更新框架 ===
npm install -g git+http://gitlab.yourcompany.com/devtools/ai-dev-pipeline.git
cd /projects/my-service
ai-dev-pipeline update
```

---

## 方案对比

| | 离线 tgz | 内网 Git |
|---|---|---|
| 前置条件 | 只需 Node.js | 需要内网 Git 服务 |
| 安装方式 | `npm install -g xxx.tgz` | `npm install -g git+http://...` |
| 更新方式 | 重新打包 + 拷贝 + 安装 | `git pull` + `git push` |
| 版本管理 | 手动管理 tgz 文件 | Git tag/branch |
| 团队分发 | 共享文件目录 | Git 仓库地址 |
| 适合场景 | 个人使用、临时环境 | 团队长期使用 |

## 安装后通用流程

无论用哪种方式安装，后续使用完全相同：

```bash
# 1. 安装框架到项目
ai-dev-pipeline init
```

然后在 AI 工具（Claude Code / CodeBuddy）中使用斜杠命令：

```
/init-pipeline          # 自动扫描项目生成配置
/dev "你的需求"          # 全自动开发流水线
```
