#!/bin/bash
# claude-dev-pipeline installer
# 将 AI 开发流水线框架安装到目标项目

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录（框架目录）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRAMEWORK_DIR="${SCRIPT_DIR}/framework"

# 目标项目目录（默认当前目录，或通过参数指定）
TARGET_DIR="${1:-.}"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo -e "${GREEN}=== Claude Dev Pipeline Installer ===${NC}"
echo ""
echo "框架目录: ${FRAMEWORK_DIR}"
echo "目标项目: ${TARGET_DIR}"
echo ""

# 检查框架目录
if [ ! -d "${FRAMEWORK_DIR}/prompts" ] || [ ! -d "${FRAMEWORK_DIR}/skills" ]; then
    echo -e "${RED}错误: 框架目录结构不完整${NC}"
    exit 1
fi

# 检查是否已安装
if [ -f "${TARGET_DIR}/.ai/project.yml" ]; then
    echo -e "${YELLOW}检测到已有 .ai/project.yml，跳过覆盖。${NC}"
    echo "如需重新初始化，请删除 .ai/project.yml 后重试。"
    echo "或在 Claude Code 中运行 /init-pipeline 重新生成配置。"
    echo ""
fi

# 创建目录结构
echo "创建目录结构..."
mkdir -p "${TARGET_DIR}/.ai/prompts"
mkdir -p "${TARGET_DIR}/.ai/artifacts/prd"
mkdir -p "${TARGET_DIR}/.ai/artifacts/design"
mkdir -p "${TARGET_DIR}/.ai/artifacts/test-plan"
mkdir -p "${TARGET_DIR}/.ai/artifacts/review"
mkdir -p "${TARGET_DIR}/.ai/artifacts/bug-report"
mkdir -p "${TARGET_DIR}/.ai/artifacts/ui-test"
mkdir -p "${TARGET_DIR}/.ai/artifacts/logs"

# 复制架构文档
echo "复制架构文档..."
cp "${FRAMEWORK_DIR}/architecture.md" "${TARGET_DIR}/.ai/architecture.md"
cp "${FRAMEWORK_DIR}/workflow.md" "${TARGET_DIR}/.ai/workflow.md"

# 复制 Prompt 文件
echo "复制角色 Prompt..."
for prompt_file in "${FRAMEWORK_DIR}/prompts/"*.md; do
    filename=$(basename "$prompt_file")
    cp "$prompt_file" "${TARGET_DIR}/.ai/prompts/${filename}"
done

# 复制 Skill 文件
echo "复制 Skill 定义..."
for skill_dir in "${FRAMEWORK_DIR}/skills/"*/; do
    skill_name=$(basename "$skill_dir")
    mkdir -p "${TARGET_DIR}/.claude/skills/${skill_name}"
    cp "${skill_dir}SKILL.md" "${TARGET_DIR}/.claude/skills/${skill_name}/SKILL.md"
done

# 复制项目配置模板（仅当不存在时）
if [ ! -f "${TARGET_DIR}/.ai/project.yml" ]; then
    echo "复制项目配置模板..."
    cp "${FRAMEWORK_DIR}/templates/project.yml.template" "${TARGET_DIR}/.ai/project.yml"
fi

# 统计
PROMPT_COUNT=$(ls -1 "${TARGET_DIR}/.ai/prompts/"*.md 2>/dev/null | wc -l | tr -d ' ')
SKILL_COUNT=$(ls -1d "${TARGET_DIR}/.claude/skills/"*/ 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}=== 安装完成 ===${NC}"
echo ""
echo "已安装:"
echo "  - ${PROMPT_COUNT} 个角色 Prompt (.ai/prompts/)"
echo "  - ${SKILL_COUNT} 个 Skill (.claude/skills/)"
echo "  - 制品目录结构 (.ai/artifacts/)"
echo "  - 架构文档 (.ai/architecture.md, .ai/workflow.md)"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "  1. 在 Claude Code 中打开项目"
echo "  2. 运行 /init-pipeline 自动扫描项目并生成配置"
echo "  3. 确认配置后即可使用 /dev \"需求\" 开始开发"
echo ""
echo "或手动编辑 .ai/project.yml 填入项目配置。"
