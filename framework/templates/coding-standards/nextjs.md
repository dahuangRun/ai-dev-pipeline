# 编码规范 — Next.js (TypeScript)

> 技术栈: TypeScript + Next.js
> 适用框架: Next.js 13+ (App Router)

## 项目结构

```
app/            → 路由和页面（App Router）
components/     → 可复用 UI 组件
lib/            → 工具函数、API 客户端
types/          → TypeScript 类型定义
hooks/          → 自定义 React Hooks
styles/         → 全局样式
public/         → 静态资源
```

## 命名约定

- 组件: PascalCase（如 `UserProfile.tsx`）
- 工具函数: camelCase（如 `formatDate.ts`）
- 类型/接口: PascalCase，以 `I` 或无前缀（如 `User`, `IApiResponse`）
- 常量: UPPER_SNAKE_CASE 或 camelCase（视项目而定）
- CSS 模块: `component.module.css`

## 组件规范

- 使用函数组件 + Hooks
- Props 使用 TypeScript interface 定义
- 使用 `"use client"` / `"use server"` 显式声明

## API 规范

- Route Handlers 在 `app/api/` 下
- 使用 `NextRequest` / `NextResponse`
- 错误返回统一格式

## 测试规范

### 框架

- Jest + React Testing Library
- 或 Vitest + Testing Library

### 组织

- 测试文件: `__tests__/` 或 `*.test.tsx`
- 使用 `describe` / `it` 结构
