#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ─── 颜色 ────────────────────────────────────────────
const color = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

// ─── 路径 ────────────────────────────────────────────
const FRAMEWORK_DIR = path.join(__dirname, '..', 'framework');
const TARGET_DIR = process.cwd();

// ─── 工具函数 ────────────────────────────────────────
function copyDir(src, dest, overwrite = true) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, overwrite);
    } else {
      if (!overwrite && fs.existsSync(destPath)) continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(TARGET_DIR, filePath));
}

// ─── init 命令 ───────────────────────────────────────
function cmdInit() {
  console.log(color.green('\n=== Claude Dev Pipeline — Init ===\n'));
  console.log(`目标项目: ${TARGET_DIR}\n`);

  // 1. 创建制品目录
  console.log('创建目录结构...');
  const artifactDirs = [
    '.ai/prompts',
    '.ai/artifacts/prd',
    '.ai/artifacts/design',
    '.ai/artifacts/test-plan',
    '.ai/artifacts/review',
    '.ai/artifacts/bug-report',
    '.ai/artifacts/ui-test',
    '.ai/artifacts/logs',
  ];
  for (const dir of artifactDirs) {
    ensureDir(path.join(TARGET_DIR, dir));
  }

  // 2. 复制架构文档
  console.log('复制架构文档...');
  fs.copyFileSync(
    path.join(FRAMEWORK_DIR, 'architecture.md'),
    path.join(TARGET_DIR, '.ai', 'architecture.md')
  );
  fs.copyFileSync(
    path.join(FRAMEWORK_DIR, 'workflow.md'),
    path.join(TARGET_DIR, '.ai', 'workflow.md')
  );

  // 3. 复制 Prompt 文件
  console.log('复制角色 Prompt...');
  copyDir(
    path.join(FRAMEWORK_DIR, 'prompts'),
    path.join(TARGET_DIR, '.ai', 'prompts')
  );

  // 4. 复制 Skill 文件
  console.log('复制 Skill 定义...');
  copyDir(
    path.join(FRAMEWORK_DIR, 'skills'),
    path.join(TARGET_DIR, '.claude', 'skills')
  );

  // 5. 复制项目配置模板（不覆盖已有）
  const projectYml = path.join(TARGET_DIR, '.ai', 'project.yml');
  if (!fs.existsSync(projectYml)) {
    console.log('复制项目配置模板...');
    fs.copyFileSync(
      path.join(FRAMEWORK_DIR, 'templates', 'project.yml.template'),
      projectYml
    );
  } else {
    console.log(color.yellow('跳过 project.yml（已存在）'));
  }

  // 6. 统计
  const promptCount = fs.readdirSync(path.join(TARGET_DIR, '.ai', 'prompts')).filter(f => f.endsWith('.md')).length;
  const skillCount = fs.readdirSync(path.join(TARGET_DIR, '.claude', 'skills')).filter(f => {
    return fs.statSync(path.join(TARGET_DIR, '.claude', 'skills', f)).isDirectory();
  }).length;

  console.log(color.green('\n=== 安装完成 ===\n'));
  console.log(`  ${color.cyan(promptCount)} 个角色 Prompt  → .ai/prompts/`);
  console.log(`  ${color.cyan(skillCount)} 个 Skill       → .claude/skills/`);
  console.log(`  制品目录结构      → .ai/artifacts/`);
  console.log(`  架构文档          → .ai/architecture.md`);
  console.log('');
  console.log(color.yellow('下一步:'));
  console.log('  1. 在 Claude Code 中打开此项目');
  console.log('  2. 运行 /init-pipeline 自动扫描项目并生成配置');
  console.log('  3. 确认配置后即可使用 /dev "需求" 开始开发');
  console.log('');
}

// ─── update 命令 ──────────────────────────────────────
function cmdUpdate() {
  console.log(color.green('\n=== Claude Dev Pipeline — Update ===\n'));
  console.log(`目标项目: ${TARGET_DIR}\n`);

  // 检查是否已初始化
  if (!fileExists('.ai/prompts') || !fileExists('.claude/skills')) {
    console.log(color.red('错误: 项目尚未初始化。请先运行: claude-dev-pipeline init'));
    process.exit(1);
  }

  // 更新 Prompt（覆盖）
  console.log('更新角色 Prompt...');
  copyDir(
    path.join(FRAMEWORK_DIR, 'prompts'),
    path.join(TARGET_DIR, '.ai', 'prompts'),
    true
  );

  // 更新 Skill（覆盖）
  console.log('更新 Skill 定义...');
  copyDir(
    path.join(FRAMEWORK_DIR, 'skills'),
    path.join(TARGET_DIR, '.claude', 'skills'),
    true
  );

  // 更新架构文档
  console.log('更新架构文档...');
  fs.copyFileSync(
    path.join(FRAMEWORK_DIR, 'architecture.md'),
    path.join(TARGET_DIR, '.ai', 'architecture.md')
  );
  fs.copyFileSync(
    path.join(FRAMEWORK_DIR, 'workflow.md'),
    path.join(TARGET_DIR, '.ai', 'workflow.md')
  );

  // 不覆盖 project.yml 和 coding-standards.md
  console.log(color.yellow('保留: .ai/project.yml（不覆盖）'));
  console.log(color.yellow('保留: .ai/coding-standards.md（不覆盖）'));

  console.log(color.green('\n=== 更新完成 ===\n'));
  console.log('Prompt 和 Skill 已更新到最新版本。');
  console.log('项目配置和编码规范未被修改。');
  console.log('');
}

// ─── doctor 命令 ──────────────────────────────────────
function cmdDoctor() {
  console.log(color.green('\n=== Claude Dev Pipeline — Doctor ===\n'));

  let issues = 0;
  let warnings = 0;

  function check(label, condition) {
    if (condition) {
      console.log(`  ${color.green('✓')} ${label}`);
    } else {
      console.log(`  ${color.red('✗')} ${label}`);
      issues++;
    }
  }

  function warn(label, condition) {
    if (condition) {
      console.log(`  ${color.green('✓')} ${label}`);
    } else {
      console.log(`  ${color.yellow('⚠')} ${label}`);
      warnings++;
    }
  }

  console.log('目录结构:');
  check('.ai/prompts/ 存在', fileExists('.ai/prompts'));
  check('.ai/artifacts/ 存在', fileExists('.ai/artifacts'));
  check('.claude/skills/ 存在', fileExists('.claude/skills'));

  console.log('\n配置文件:');
  check('.ai/project.yml 存在', fileExists('.ai/project.yml'));
  warn('.ai/coding-standards.md 存在', fileExists('.ai/coding-standards.md'));

  console.log('\n角色 Prompt:');
  const requiredPrompts = ['analyst', 'planner', 'coder', 'reviewer', 'qa', 'ui-test'];
  for (const name of requiredPrompts) {
    check(`${name}.md`, fileExists(`.ai/prompts/${name}.md`));
  }

  console.log('\nSkill 定义:');
  const requiredSkills = ['analyst', 'planner', 'coder', 'reviewer', 'qa', 'ui-test', 'dev', 'ship', 'init-pipeline'];
  for (const name of requiredSkills) {
    check(`${name}/SKILL.md`, fileExists(`.claude/skills/${name}/SKILL.md`));
  }

  // 检查 project.yml 是否已配置（非模板状态）
  if (fileExists('.ai/project.yml')) {
    console.log('\n项目配置:');
    const content = fs.readFileSync(path.join(TARGET_DIR, '.ai/project.yml'), 'utf-8');
    warn('project.name 已配置', !content.includes('name: ""'));
    warn('commands.test 已配置', !content.includes('test: ""'));
  }

  console.log('');
  if (issues > 0) {
    console.log(color.red(`发现 ${issues} 个问题。运行 claude-dev-pipeline init 修复。`));
  } else if (warnings > 0) {
    console.log(color.yellow(`${warnings} 个警告。运行 /init-pipeline 自动生成配置。`));
  } else {
    console.log(color.green('一切正常！'));
  }
  console.log('');
}

// ─── 帮助 ────────────────────────────────────────────
function cmdHelp() {
  console.log(`
${color.green('Claude Dev Pipeline')} — AI 驱动的全自动开发流水线

${color.yellow('用法:')}
  claude-dev-pipeline <command>
  npx claude-dev-pipeline <command>

${color.yellow('命令:')}
  init      安装流水线框架到当前项目
  update    更新 Prompt 和 Skill 到最新版（保留项目配置）
  doctor    检查配置完整性
  help      显示帮助信息

${color.yellow('安装后:')}
  1. 在 Claude Code 中运行 /init-pipeline  → AI 自动扫描项目生成配置
  2. 运行 /dev "需求"                       → 全自动开发流水线
`);
}

// ─── 主入口 ──────────────────────────────────────────
const command = process.argv[2];

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'update':
    cmdUpdate();
    break;
  case 'doctor':
    cmdDoctor();
    break;
  case 'help':
  case '--help':
  case '-h':
    cmdHelp();
    break;
  default:
    if (command) {
      console.log(color.red(`未知命令: ${command}\n`));
    }
    cmdHelp();
    break;
}
