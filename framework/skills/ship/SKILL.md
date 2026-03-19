---
name: ship
description: "发布流水线：代码审查 → 测试 → commit+push+PR → 部署 → 冒烟测试。触发词：/ship、ship it、release、发布、部署上线。所有命令从 .ai/project.yml 读取。"
---

# Ship — 发布流水线

**首先阅读 `.ai/project.yml`**，获取：
- `commands.test` — 测试命令
- `deploy.method` — 部署方式
- `deploy.command` — 部署命令
- `deploy.server` — 目标服务器
- `deploy.port` — 服务端口
- `deploy.health_check` — 健康检查路径

---

## Step 1/5 — Code Review

告诉用户: **"Step 1/5: Reviewing changed code..."**

运行 `git diff HEAD` 审查所有修改文件：
- **正确性**: 逻辑错误、空指针、边界条件
- **安全性**: 注入攻击、未验证输入、暴露凭证
- **质量**: 死代码、重复逻辑、复杂方法

发现问题直接修复。无问题则继续。

---

## Step 2/5 — 运行测试

告诉用户: **"Step 2/5: Running tests..."**

```bash
# 使用 project.yml 中的测试命令
[commands.test]
```

- 测试通过 → 继续
- 测试失败 → **停止**，告诉用户修复后重新 `/ship`

---

## Step 3/5 — Commit, Push, PR

告诉用户: **"Step 3/5: Committing and pushing..."**

1. `git status` + `git diff HEAD` 了解变更
2. 如果在 main/master，先创建新分支
3. Stage 相关文件，创建 commit
4. Push 到 origin
5. `gh pr create` 开 PR

失败则停止。

---

## Step 4/5 — 部署

告诉用户: **"Step 4/5: Deploying..."**

根据 `deploy.method`：

- **`script`**: 运行 `deploy.command`
- **`docker-compose`**: 运行 `docker-compose up -d --build`
- **`none`**: 跳过，告诉用户 "部署未配置，跳过"
- **其他**: 运行 `deploy.command`（如有）

失败则停止，展示错误。

---

## Step 5/5 — 冒烟测试

告诉用户: **"Step 5/5: Running smoke test..."**

如果 `deploy.server` 和 `deploy.health_check` 已配置：

```bash
# 等待服务启动（最多 60 秒）
for i in $(seq 1 12); do
  if curl -sf http://{server}:{port}{health_check[0]} > /dev/null 2>&1; then
    echo "Service is up"
    break
  fi
  echo "Waiting for service... ($i/12)"
  sleep 5
done

# 验证各端点
for path in health_check; do
  curl -sf -o /dev/null -w "%{http_code}" http://{server}:{port}${path}
done
```

如果未配置部署（`deploy.method = none`），跳过冒烟测试。

---

## 最终报告

```
Pipeline complete.
✓ Code reviewed
✓ Tests passed
✓ PR opened: <url>
✓ Deployed to {server}:{port}（或 "Deploy skipped"）
✓ Smoke test passed（或 "Smoke test skipped"）
```
