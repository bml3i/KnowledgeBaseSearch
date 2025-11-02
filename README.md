# Knowledge Base Search

一个基于标签进行搜索、过滤的个人知识库查询系统。当前项目采用 Docker Compose 进行开发运行，目录已重构为 `client/`、`server/`、`db/` 三部分。

## 功能特点

- 基于标签的知识库条目过滤
- 简单的用户认证
- 响应式单页面应用
- PostgreSQL 数据库存储
- 分页显示结果

## 技术栈

- 后端: Node.js, Express, bcryptjs
- 前端: React (Create React App)
- 数据库: PostgreSQL
- 认证: JWT

## 项目结构

- `client/`: 前端 React 应用（开发模式运行于 3000）
- `server/`: 后端 Node/Express 服务（运行于 5000）
- `db/`: 数据库初始化脚本（`init.sql` 由 Postgres 容器自动执行）
- `docker-compose.yml`: 服务编排（db/adminer/server/client）
- `env.example`: 环境变量模板文件

## 端口与服务

- 前端: `http://localhost:3000`
- 后端: `http://localhost:5000`
- Postgres: `localhost:5432`（容器内服务名 `db`）
- Adminer: `http://localhost:8080`

## 快速开始（Docker Compose）

### 前提条件

- Docker 与 Docker Compose

### 环境配置

1. 复制环境变量模板文件：
   ```bash
   cp env.example .env
   ```

2. 编辑 `.env` 文件，根据需要修改配置：
   ```bash
   # 服务器配置
   ITEMS_PER_PAGE=5
   
   # 数据库配置（Docker Compose 默认值）
   DB_HOST=db
   DB_PORT=5432
   DB_NAME=kb_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   
   # 认证配置（请修改为安全值）
   JWT_SECRET=your-strong-random-secret-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=update-to-your-secure-password
   ```

### 启动

```bash
docker compose up -d
```

- 首次启动将自动构建镜像并初始化数据库。
- 查看日志：`docker compose logs -f` 或分别查看某服务，如 `docker compose logs client`。

### 访问

- 前端：`http://localhost:3000`
- 后端示例：`http://localhost:5000/api/tags`
- Adminer：`http://localhost:8080`（System: PostgreSQL, Server: db, User: postgres, Password: postgres, Database: kb_db）

### 关闭

```bash
docker compose down
```

清除数据卷（会重置数据库并重新执行 `init.sql`）：

```bash
docker compose down -v
```

## 开发配置说明

- 代码绑定挂载（bind mount）：`./client:/app`、`./server:/app`，确保代码改动即时生效。
- 依赖缓存（named volume）：`client_node_modules:/app/node_modules`、`server_node_modules:/app/node_modules`，避免每次启动都安装依赖。
- 客户端端口与绑定：在 Compose 中显式设置 `PORT=3000`、`HOST=0.0.0.0`，对应 `ports: "3000:3000"`。
- 代理：`client/src/setupProxy.js` 通过容器内主机名 `server:5000` 代理到后端。
- Windows 文件系统下若热更新不稳定，可在 `client` 服务添加 `CHOKIDAR_USEPOLLING=true`（可选）。

## 切换到远程数据库（可选）

在 `.env` 文件中调整数据库配置：

```bash
# 远程数据库配置示例
DB_HOST=your-host.com
DB_PORT=your-db-port
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password

# 如使用托管服务（例如 Supabase），可能需要 SSL 配置
DB_SSL_MODE=require
DB_SSL_REJECT_UNAUTHORIZED=false
```

如仅使用远程数据库，可将本地 `db` 与 `adminer` 服务移除或暂时注释。

## 常见问题

- **环境变量未生效**：确保已从 `env.example` 复制创建 `.env` 文件，并重启服务 `docker compose down && docker compose up -d`。
- **客户端未在 3000 端口启动**：确保 `client/.env` 为 `PORT=3000`，并在 Compose 中设置 `PORT` 与 `HOST` 环境变量。
- **数据库初始化失败**：执行 `docker compose down -v` 清理数据卷后重新 `docker compose up -d`，查看 `db/init.sql` 是否语法正确。
- **依赖安装问题**：如修改了 `package.json`，需要重新安装依赖到命名卷：`docker compose run --rm server npm install --omit=dev`。
- **查看服务状态**：`docker ps -a` 与 `docker compose logs <service>`。

## 数据库结构

系统使用以下表结构：

- `kb_records`: 知识库主表
- `kb_tags`: 标签维度表
- `kb_record_tags`: 记录和标签的多对多关系表
- `v_kb_search`: 聚合视图，包含完整的记录信息和标签
- `v_active_kb_search`: 仅包含活跃记录的聚合视图

## 许可证

ISC