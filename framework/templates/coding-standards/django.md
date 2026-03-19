# 编码规范 — Django (Python)

> 技术栈: Python + Django
> 适用框架: Django 4.x / 5.x

## 项目结构

```
project_name/
├── settings.py      → 配置
├── urls.py          → 根路由
├── wsgi.py / asgi.py
apps/
├── app_name/
│   ├── models.py    → 数据模型
│   ├── views.py     → 视图/API
│   ├── serializers.py → DRF 序列化器
│   ├── urls.py      → 应用路由
│   ├── admin.py     → 管理后台
│   ├── tests.py     → 测试
│   └── migrations/  → 数据库迁移
```

## 命名约定

- 类名: PascalCase（如 `UserProfile`, `DocumentSerializer`）
- 函数/方法: snake_case（如 `get_user_by_id`）
- 变量: snake_case
- 常量: UPPER_SNAKE_CASE
- 文件名: snake_case

## 模型规范

- 使用 Django ORM
- Model 中定义 `__str__` 方法
- 使用 `Meta` 类定义排序、表名等

## API 规范（Django REST Framework）

- ViewSet 或 APIView
- Serializer 做数据校验和序列化
- 权限类控制访问
- 统一分页

## 数据库

- 使用 `python manage.py makemigrations` 生成迁移
- 不手动编辑迁移文件（除非必要）

## 测试规范

### 框架

- Django TestCase 或 pytest-django
- `python manage.py test` 或 `pytest`

### 组织

- 测试文件: `tests.py` 或 `tests/` 目录
- 使用 `TestCase` 基类
- `setUp` / `tearDown` 管理测试数据
