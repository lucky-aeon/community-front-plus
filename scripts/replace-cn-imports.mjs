#!/usr/bin/env node
// 一键替换 cn 导入路径脚本
// 将 `import { cn } from '@/lib/utils'` 统一替换为 `import { cn } from '@shared/utils/cn'`
// 使用: node scripts/replace-cn-imports.mjs

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const TARGET_EXTS = new Set(['.ts', '.tsx']);

const REPLACEMENTS = [
  // from '@/lib/utils' → from '@shared/utils/cn'
  [/from\s+['\"]@\/lib\/utils['\"]/g, "from '@shared/utils/cn'"],
  // from "@/lib/utils" → from "@shared/utils/cn"
  [/from\s+["']@\/lib\/utils["']/g, 'from "@shared/utils/cn"'],
  // 少量可能存在的相对/绝对引用兜底
  [/from\s+['\"]\.\.\/lib\/utils['\"]/g, "from '@shared/utils/cn'"],
  [/from\s+['\"]src\/lib\/utils['\"]/g, "from '@shared/utils/cn'"],
  // 统一去掉多余的后缀
  [/from\s+['\"]@shared\/utils\/cn\.ts['\"]/g, "from '@shared/utils/cn'"],
  [/from\s+["']@shared\/utils\/cn\.ts["']/g, 'from "@shared/utils/cn"'],
];

/**
 * 遍历目录，收集目标文件
 */
function collectFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      collectFiles(p, acc);
    } else if (TARGET_EXTS.has(extname(name))) {
      acc.push(p);
    }
  }
  return acc;
}

function run() {
  const files = collectFiles(SRC_DIR);
  let changed = 0;
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    let after = before;
    for (const [pattern, replacement] of REPLACEMENTS) {
      after = after.replace(pattern, replacement);
    }
    if (after !== before) {
      writeFileSync(file, after, 'utf8');
      changed++;
      console.log(`updated: ${file}`);
    }
  }
  console.log(`Done. Updated files: ${changed}`);
}

run();

