# 编码规范 — Go

> 技术栈: Go
> 适用框架: 标准库 / Gin / Echo / Fiber

## 项目结构

```
cmd/            → 入口 main 包
internal/       → 私有应用代码
  handler/      → HTTP 处理器
  service/      → 业务逻辑
  repository/   → 数据访问
  model/        → 数据结构
  middleware/   → 中间件
pkg/            → 可导出的公共包
config/         → 配置
migrations/     → 数据库迁移
```

## 命名约定

- 包名: 全小写，单词（如 `user`, `handler`）
- 导出标识符: PascalCase（如 `GetUserByID`）
- 未导出标识符: camelCase（如 `parseToken`）
- 接口: 以 `-er` 结尾（如 `Reader`, `UserService`）
- 文件名: snake_case（如 `user_handler.go`）

## 错误处理

- 返回 `error` 作为最后一个返回值
- 使用 `fmt.Errorf("context: %w", err)` 包装错误
- 不忽略错误

## 测试规范

### 框架

- 标准库 `testing` 包
- 可选: `testify/assert`

### 组织

- 测试文件: `*_test.go`，与被测文件同目录
- 测试函数: `TestXxx(t *testing.T)`
- 表驱动测试风格

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"zero", 0, 0, 0},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            assert.Equal(t, tt.expected, got)
        })
    }
}
```
