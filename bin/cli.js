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

// ─── 支持的 AI 工具 ─────────────────────────────────
const TOOLS = {
  'claude-code': {
    name: 'Claude Code',
    skillDir: '.claude/skills',
    skillFormat: 'claude',
    detect: () => fs.existsSync(path.join(TARGET_DIR, '.claude')),
  },
  cursor: {
    name: 'Cursor',
    skillDir: '.cursor/rules',
    skillFormat: 'cursor',
    detect: () =>
      fs.existsSync(path.join(TARGET_DIR, '.cursor')) ||
      fs.existsSync(path.join(TARGET_DIR, '.cursorrules')),
  },
  codex: {
    name: 'Codex',
    skillDir: '.codex',
    skillFormat: 'generic',
    detect: () => fs.existsSync(path.join(TARGET_DIR, '.codex')),
  },
  codebuddy: {
    name: 'CodeBuddy',
    skillDir: '.codebuddy/rules',
    skillFormat: 'generic',
    detect: () => fs.existsSync(path.join(TARGET_DIR, '.codebuddy')),
  },
  generic: {
    name: 'Generic',
    skillDir: '.ai/instructions',
    skillFormat: 'generic',
    detect: () => true, // fallback
  },
};

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

// ─── 检测 AI 工具 ───────────────────────────────────
function detectTool(forceToolName) {
  if (forceToolName) {
    const tool = TOOLS[forceToolName];
    if (!tool) {
      console.log(color.red(`未知工具: ${forceToolName}`));
      console.log(`支持的工具: ${Object.keys(TOOLS).join(', ')}`);
      process.exit(1);
    }
    return { id: forceToolName, ...tool };
  }

  for (const [id, tool] of Object.entries(TOOLS)) {
    if (id === 'generic') continue; // generic is fallback
    if (tool.detect()) {
      return { id, ...tool };
    }
  }
  return { id: 'generic', ...TOOLS.generic };
}

// ─── 安装技能（按工具格式）─────────────────────────
function installSkills(tool) {
  const skillsSrcDir = path.join(FRAMEWORK_DIR, 'skills');
  const skillEntries = fs.readdirSync(skillsSrcDir, { withFileTypes: true })
    .filter(e => e.isDirectory());

  if (tool.skillFormat === 'claude') {
    // Claude Code: .claude/skills/*/SKILL.md（原始格式，直接复制）
    console.log(`安装技能 → ${tool.skillDir}/ (Claude Code 格式)...`);
    copyDir(skillsSrcDir, path.join(TARGET_DIR, tool.skillDir));
    return skillEntries.length;
  }

  if (tool.skillFormat === 'cursor') {
    // Cursor: .cursor/rules/ 下每个技能一个 .md 文件
    console.log(`安装技能 → ${tool.skillDir}/ (Cursor 格式)...`);
    const destDir = path.join(TARGET_DIR, tool.skillDir);
    ensureDir(destDir);

    for (const entry of skillEntries) {
      const skillFile = path.join(skillsSrcDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      let content = fs.readFileSync(skillFile, 'utf-8');
      // 转换 frontmatter: Cursor 使用 description 作为 globs/alwaysApply
      content = convertToCursorFormat(content, entry.name);
      fs.writeFileSync(path.join(destDir, `${entry.name}.md`), content);
    }
    return skillEntries.length;
  }

  // Generic: 合并为单个指令文件
  console.log(`安装技能 → ${tool.skillDir}/ (通用格式)...`);
  const destDir = path.join(TARGET_DIR, tool.skillDir);
  ensureDir(destDir);

  // 生成合并指令文件
  let combined = '# AI Dev Pipeline — 技能指令\n\n';
  combined += '> 此文件由 ai-dev-pipeline 自动生成，包含所有流水线技能的指令。\n';
  combined += '> 将此文件的内容添加到你的 AI 编码工具的系统指令/规则中。\n\n';

  for (const entry of skillEntries) {
    const skillFile = path.join(skillsSrcDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    let content = fs.readFileSync(skillFile, 'utf-8');
    // 去掉 frontmatter
    content = content.replace(/^---[\s\S]*?---\n*/, '');
    combined += `---\n\n## Skill: ${entry.name}\n\n${content}\n\n`;
  }

  fs.writeFileSync(path.join(destDir, 'all-skills.md'), combined);

  // 同时输出单独文件方便按需引用
  for (const entry of skillEntries) {
    const skillFile = path.join(skillsSrcDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    fs.copyFileSync(skillFile, path.join(destDir, `${entry.name}.md`));
  }
  return skillEntries.length;
}

function convertToCursorFormat(content, skillName) {
  // 提取 frontmatter 中的 description
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let description = '';
  let body = content;

  if (fmMatch) {
    const fm = fmMatch[1];
    const descMatch = fm.match(/description:\s*"([^"]+)"/);
    if (descMatch) description = descMatch[1];
    body = content.slice(fmMatch[0].length).trim();
  }

  // Cursor 格式：使用注释头说明触发条件
  let result = '';
  result += `<!-- Skill: ${skillName} -->\n`;
  result += `<!-- Trigger: ${description} -->\n\n`;
  result += body;
  return result;
}

// ─── init 命令 ───────────────────────────────────────
function cmdInit(toolName) {
  const tool = detectTool(toolName);

  console.log(color.green('\n=== AI Dev Pipeline — Init ===\n'));
  console.log(`目标项目: ${TARGET_DIR}`);
  console.log(`AI 工具:  ${color.cyan(tool.name)}${toolName ? '' : color.dim(' (自动检测)')}\n`);

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

  // 3. 复制 Prompt 文件（通用，与工具无关）
  console.log('复制角色 Prompt...');
  copyDir(
    path.join(FRAMEWORK_DIR, 'prompts'),
    path.join(TARGET_DIR, '.ai', 'prompts')
  );

  // 4. 安装技能（按工具格式）
  const skillCount = installSkills(tool);

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
  const promptCount = fs.readdirSync(path.join(TARGET_DIR, '.ai', 'prompts'))
    .filter(f => f.endsWith('.md')).length;

  console.log(color.green('\n=== 安装完成 ===\n'));
  console.log(`  ${color.cyan(promptCount)} 个角色 Prompt  → .ai/prompts/`);
  console.log(`  ${color.cyan(skillCount)} 个技能定义     → ${tool.skillDir}/`);
  console.log(`  制品目录结构      → .ai/artifacts/`);
  console.log(`  架构文档          → .ai/architecture.md`);
  console.log('');
  console.log(color.yellow('下一步:'));
  if (tool.id === 'claude-code') {
    console.log('  1. 在 Claude Code 中打开此项目');
    console.log('  2. 运行 /init-pipeline 自动扫描项目并生成配置');
    console.log('  3. 确认配置后即可使用 /dev "需求" 开始开发');
  } else if (tool.id === 'cursor') {
    console.log('  1. 在 Cursor 中打开此项目');
    console.log('  2. 告诉 AI: "阅读 .ai/instructions/ 下的 init-pipeline.md 并执行"');
    console.log('  3. AI 会自动扫描项目并生成配置');
    console.log('  4. 确认配置后告诉 AI: "阅读 .ai/instructions/dev.md，执行全流程开发"');
  } else {
    console.log('  1. 在你的 AI 编码工具中打开此项目');
    console.log('  2. 告诉 AI: "阅读 .ai/instructions/init-pipeline.md 并执行"');
    console.log('  3. AI 会自动扫描项目并生成配置');
    console.log('  4. 开发时告诉 AI: "按照 .ai/instructions/dev.md 的流程执行"');
  }
  console.log('');
}

// ─── update 命令 ──────────────────────────────────────
function cmdUpdate(toolName) {
  const tool = detectTool(toolName);

  console.log(color.green('\n=== AI Dev Pipeline — Update ===\n'));
  console.log(`目标项目: ${TARGET_DIR}`);
  console.log(`AI 工具:  ${color.cyan(tool.name)}\n`);

  // 检查是否已初始化
  if (!fileExists('.ai/prompts')) {
    console.log(color.red('错误: 项目尚未初始化。请先运行: ai-dev-pipeline init'));
    process.exit(1);
  }

  // 更新 Prompt（覆盖）
  console.log('更新角色 Prompt...');
  copyDir(
    path.join(FRAMEWORK_DIR, 'prompts'),
    path.join(TARGET_DIR, '.ai', 'prompts'),
    true
  );

  // 更新技能（覆盖）
  installSkills(tool);

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

  console.log(color.yellow('保留: .ai/project.yml（不覆盖）'));
  console.log(color.yellow('保留: .ai/coding-standards.md（不覆盖）'));

  console.log(color.green('\n=== 更新完成 ===\n'));
  console.log('Prompt 和技能定义已更新到最新版本。');
  console.log('项目配置和编码规范未被修改。');
  console.log('');
}

// ─── doctor 命令 ──────────────────────────────────────
function cmdDoctor(toolName) {
  const tool = detectTool(toolName);

  console.log(color.green('\n=== AI Dev Pipeline — Doctor ===\n'));
  console.log(`AI 工具: ${color.cyan(tool.name)}\n`);

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

  console.log('通用结构:');
  check('.ai/prompts/ 存在', fileExists('.ai/prompts'));
  check('.ai/artifacts/ 存在', fileExists('.ai/artifacts'));
  check(`${tool.skillDir}/ 存在`, fileExists(tool.skillDir));

  console.log('\n配置文件:');
  check('.ai/project.yml 存在', fileExists('.ai/project.yml'));
  warn('.ai/coding-standards.md 存在', fileExists('.ai/coding-standards.md'));

  console.log('\n角色 Prompt:');
  const requiredPrompts = ['analyst', 'planner', 'coder', 'reviewer', 'qa', 'ui-test'];
  for (const name of requiredPrompts) {
    check(`${name}.md`, fileExists(`.ai/prompts/${name}.md`));
  }

  console.log('\n技能定义:');
  if (tool.skillFormat === 'claude') {
    const requiredSkills = ['analyst', 'planner', 'coder', 'reviewer', 'qa', 'ui-test', 'dev', 'ship', 'init-pipeline'];
    for (const name of requiredSkills) {
      check(`${name}/SKILL.md`, fileExists(`${tool.skillDir}/${name}/SKILL.md`));
    }
  } else if (tool.skillFormat === 'cursor') {
    const requiredSkills = ['analyst', 'planner', 'coder', 'reviewer', 'qa', 'ui-test', 'dev', 'ship', 'init-pipeline'];
    for (const name of requiredSkills) {
      check(`${name}.md`, fileExists(`${tool.skillDir}/${name}.md`));
    }
  } else {
    check('all-skills.md', fileExists(`${tool.skillDir}/all-skills.md`));
  }

  if (fileExists('.ai/project.yml')) {
    console.log('\n项目配置:');
    const content = fs.readFileSync(path.join(TARGET_DIR, '.ai/project.yml'), 'utf-8');
    warn('project.name 已配置', !content.includes('name: ""'));
    warn('commands.test 已配置', !content.includes('test: ""'));
  }

  console.log('');
  if (issues > 0) {
    console.log(color.red(`发现 ${issues} 个问题。运行 ai-dev-pipeline init 修复。`));
  } else if (warnings > 0) {
    console.log(color.yellow(`${warnings} 个警告。在 AI 工具中运行 init-pipeline 自动生成配置。`));
  } else {
    console.log(color.green('一切正常！'));
  }
  console.log('');
}

// ─── 帮助 ────────────────────────────────────────────
function cmdHelp() {
  console.log(`
${color.green('AI Dev Pipeline')} — AI 驱动的全自动开发流水线

${color.yellow('用法:')}
  ai-dev-pipeline <command> [--tool <tool>]
  npx ai-dev-pipeline <command> [--tool <tool>]

${color.yellow('命令:')}
  init      安装流水线框架到当前项目
  update    更新 Prompt 和技能到最新版（保留项目配置）
  doctor    检查配置完整性
  help      显示帮助信息

${color.yellow('选项:')}
  --tool <tool>   指定 AI 工具（自动检测时可省略）
                  支持: claude-code, cursor, codebuddy, codex, generic

${color.yellow('示例:')}
  ai-dev-pipeline init                    # 自动检测 AI 工具
  ai-dev-pipeline init --tool cursor      # 指定 Cursor
  ai-dev-pipeline init --tool claude-code # 指定 Claude Code
  ai-dev-pipeline update                  # 更新框架
  ai-dev-pipeline doctor                  # 检查配置

${color.yellow('支持的 AI 工具:')}
  claude-code   Claude Code (.claude/skills/)
  cursor        Cursor (.cursor/rules/)
  codebuddy     CodeBuddy (.codebuddy/rules/)
  codex         Codex (.codex/)
  generic       通用（生成指令文件到 .ai/instructions/）
`);
}

// ─── 解析参数 ────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args.find(a => !a.startsWith('--'));
  let toolName = null;

  const toolIdx = args.indexOf('--tool');
  if (toolIdx !== -1 && args[toolIdx + 1]) {
    toolName = args[toolIdx + 1];
  }

  return { command, toolName };
}

// ─── 主入口 ──────────────────────────────────────────
const { command, toolName } = parseArgs();

switch (command) {
  case 'init':
    cmdInit(toolName);
    break;
  case 'update':
    cmdUpdate(toolName);
    break;
  case 'doctor':
    cmdDoctor(toolName);
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
