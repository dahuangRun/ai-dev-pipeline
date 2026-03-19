---
name: deploy-to-cloud
description: "部署项目到远程服务器。所有配置从 .ai/project.yml 读取。触发词：/deploy、deploy、部署、推送到服务器、发布到线上。"
---

# Deploy to Cloud Server

**首先阅读 `.ai/project.yml`**，获取部署配置：
- `deploy.method` — 部署方式
- `deploy.command` — 部署命令
- `deploy.server` — 目标服务器
- `deploy.port` — 服务端口

## 部署

根据 `deploy.method`：

### method: script

```bash
# 运行项目配置的部署脚本
[deploy.command]
```

### method: docker-compose

```bash
docker-compose down && docker-compose up -d --build
```

### method: none

告诉用户：部署未配置。如需配置，请编辑 `.ai/project.yml` 的 `deploy` 部分。

## 部署前检查

1. **有未保存的变更？** 确认代码已保存
2. **正确的分支？** 确认当前分支
3. **构建问题？** 如有已知编译错误，先提示

## 常见故障处理

**构建失败**：检查编译错误，修复后重新部署。

**连接失败**：检查服务器可达性和凭证配置。

**容器启动失败**：检查日志输出，常见原因：端口冲突、磁盘空间不足、环境变量错误。

## 部署后

部署成功后，检查服务状态：

```bash
# 如果配置了服务器和健康检查路径
curl -sf -o /dev/null -w "%{http_code}" http://{deploy.server}:{deploy.port}{health_check[0]}
```
