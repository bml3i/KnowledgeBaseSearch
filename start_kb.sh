#!/bin/bash
# 查找包含 "KnowledgeBaseSearch" 的进程
pids=$(pgrep -f "KnowledgeBaseSearch")

if [ -n "$pids" ]; then
    echo "检测到 KnowledgeBaseSearch 正在运行，进程号: $pids"
    echo "正在终止进程..."
    for pid in $pids; do
        echo "终止进程 $pid"
        kill -9 "$pid"
    done
    echo "所有相关进程已终止。"
fi

echo "正在启动 KnowledgeBaseSearch..."

# 使用 nohup 启动并在后台运行，并在日志中写入时间戳
nohup npm run dev:all >> nohup.out 2>&1 &
pid=$!
disown $pid

echo "$(date '+%Y-%m-%d %H:%M:%S') KnowledgeBaseSearch 已重新启动 (PID: $pid)" | tee -a nohup.out
