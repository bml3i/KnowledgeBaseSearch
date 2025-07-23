# Knowledge Base Search

一个基于标签进行搜索、过滤的个人知识库查询系统。

## 功能特点

- 基于标签的知识库条目过滤
- 简单的用户认证
- 响应式单页面应用
- PostgreSQL数据库存储
- 分页显示结果

## 技术栈

- 后端: Node.js, Express
- 前端: React
- 数据库: PostgreSQL
- 认证: JWT

## 端口配置

- 服务端默认使用 3000 端口，可通过 `.env` 文件中的 `SERVER_PORT` 环境变量配置
- 客户端固定使用 3001 端口

## 安装与设置

### 前提条件

- Node.js (v14+)
- PostgreSQL

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/KnowledgeBaseSearch.git
cd KnowledgeBaseSearch
```

2. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

3. 配置环境变量

```bash
cp .env.example .env
# 编辑.env文件，设置数据库连接信息和认证信息
```

4. 创建并初始化数据库

```bash
# 数据库结构和初始数据将在应用首次启动时自动创建
```

5. 启动应用

```bash
# 同时启动后端和前端（开发模式）
npm run dev:all

# 或者分别启动

# 仅启动后端（开发模式）
npm run dev

# 仅启动前端
npm run client
```

6. 构建前端（生产环境）

```bash
cd client
npm run build
cd ..
npm start
```

## 使用说明

1. 访问应用 (http://localhost:3001)
2. 使用环境变量中设置的用户名和密码登录
3. 在标签过滤区域选择标签以过滤知识库条目
4. 点击已选择的标签可以移除它
5. 点击Echo Token可以复制到剪贴板

## 数据库结构

系统使用以下表结构：

- `kb_records`: 知识库主表
- `kb_tags`: 标签维度表
- `kb_record_tags`: 记录和标签的多对多关系表
- `v_kb_search`: 聚合视图，包含完整的记录信息和标签
- `v_active_kb_search`: 仅包含活跃记录的聚合视图

## 许可证

ISC