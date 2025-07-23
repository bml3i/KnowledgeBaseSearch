#!/bin/bash

# 检查是否有包含 "KnowledgeBaseSearch" 关键字的进程正在运行
if ! pgrep -f "KnowledgeBaseSearch" > /dev/null; then
    echo "KnowledgeBaseSearch 未运行，正在启动..."

    # 使用 nohup 启动并在后台运行
    nohup npm run dev:all > nohup.out 2>&1 &

    echo "KnowledgeBaseSearch 已启动。"
else
    echo "KnowledgeBaseSearch 已经在运行中。"
fi