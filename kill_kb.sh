#!/bin/bash

# 查找所有包含"KnowledgeBaseSearch"字样的进程
KB_PIDS=$(pgrep -f "KnowledgeBaseSearch" | grep -v $$)

# 检查是否找到了进程
if [ -z "$KB_PIDS" ]; then
    echo "未找到包含KnowledgeBaseSearch字样的进程"
    exit 0
fi

# 显示找到的进程
echo "找到以下包含KnowledgeBaseSearch字样的进程:"
ps -f -p $KB_PIDS

# 终止所有找到的进程
echo "正在终止所有KnowledgeBaseSearch相关进程..."
kill -9 $KB_PIDS

# 检查kill命令是否成功
if [ $? -eq 0 ]; then
    echo "所有KnowledgeBaseSearch相关进程已成功终止"
    
    # 如果存在nohup_pid.log文件，清空它
    if [ -f "nohup_pid.log" ]; then
        echo "" > nohup_pid.log
        echo "已清空nohup_pid.log文件"
    fi
else
    echo "错误: 无法终止部分或全部进程，可能需要更高权限"
    exit 1
fi

# 再次检查是否还有遗漏的KnowledgeBaseSearch相关进程
REMAINING_PIDS=$(pgrep -f "KnowledgeBaseSearch" | grep -v $$)

if [ ! -z "$REMAINING_PIDS" ]; then
    echo "警告: 可能有一些KnowledgeBaseSearch相关进程未被终止:"
    ps -f -p $REMAINING_PIDS
    
    echo "尝试再次终止这些进程..."
    kill -9 $REMAINING_PIDS 2>/dev/null
    echo "操作完成。如果仍有问题，请手动检查进程状态。"
fi

echo "KnowledgeBaseSearch应用已成功停止。"
exit 0