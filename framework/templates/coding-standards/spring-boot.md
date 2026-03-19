# 编码规范 — Spring Boot (Java)

> 技术栈: Java + Spring Boot
> 适用框架: Spring Boot 2.x / 3.x

## 后端规范

### 命名约定

- 类名: PascalCase（如 `UserService`, `DocumentController`）
- 方法名: camelCase（如 `findById`, `createDocument`）
- 常量: UPPER_SNAKE_CASE（如 `MAX_FILE_SIZE`）
- 包名: 全小写（如 `com.example.service`）

### 架构分层

```
entity/     → 数据库实体，使用 JPA/@Entity 或 MyBatis-Plus/@TableName
mapper/     → 数据访问层（MyBatis-Plus BaseMapper）
repository/ → 数据访问层（JPA Repository）
service/    → 业务逻辑层，包含事务管理
controller/ → REST API 层，只做参数接收和响应封装
dto/        → 数据传输对象
vo/         → 视图对象
config/     → 配置类
util/       → 工具类
```

### API 风格

- RESTful 风格
- 统一返回格式（参考项目现有 Controller）
- 使用 `@RestController` + `@RequestMapping`
- 参数校验使用 `@Valid` + `@NotNull` 等注解

### 错误处理

- 使用全局异常处理器 `@ControllerAdvice`
- 业务异常使用自定义异常类
- 不吞掉异常，不在 catch 中只打日志不处理

### 数据库

- ORM: MyBatis-Plus（或 JPA，视项目而定）
- 迁移文件放在指定目录，命名格式: `V{version}__{description}.sql`
- 不允许手动改表结构

## 测试规范

### 框架

- JUnit 5 + Spring Boot Test
- `@SpringBootTest` 做集成测试
- `@MockBean` 隔离外部依赖

### 断言

```java
assertEquals(expected, actual);
assertNotNull(result);
assertThrows(XxxException.class, () -> { ... });
```

### 组织

- 测试类名: `{被测类名}Test`
- 测试方法名: `test_{场景描述}`
- Given/When/Then 注释结构
