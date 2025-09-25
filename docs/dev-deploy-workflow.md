# 前端项目 Dev 分支 PR 合并后自动部署技术方案

本文档描述：当主仓库 `dev` 分支被合并（PR Merge）后，自动构建前端并部署到服务器。方案基于 GitHub Actions + SSH（rsync/scp）上传 + Nginx 静态资源托管，支持原子切换与快速回滚。

## 目标与边界
- 触发：当 PR 合并到 `dev` 分支（merge 产生的 push）时自动执行；支持手动触发。
- 动作：安装依赖 → 构建产物 → 上传服务器 → 原子切换 `current` → 保留最近 N 次发布（回滚方便）。
- 成果：`dist/` 被部署至服务器的发布目录，由 Nginx 提供静态访问。

## 触发方式说明
当前默认采用“双触发”策略：
- `push` 到 `dev` 分支：直接部署。
- `pull_request` 合并到 `dev`（仅 merged 状态）：部署。
- `workflow_dispatch`：手动触发（用于修复或回滚后重建）。

为避免未合并的 PR 提前部署，工作流在 job 级别增加了条件：
`if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.pull_request.merged == true)`

## 仓库 Secrets 与环境变量
在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：
- `SSH_HOST`：服务器 IP 或域名
- `SSH_USER`：SSH 用户名（建议免密部署专用用户）
- `SSH_PORT`：SSH 端口（默认 22，可不设）
- `SSH_PRIVATE_KEY`：部署用私钥（对应公钥已加入服务器 `~/.ssh/authorized_keys`）
- `DEPLOY_BASE_DIR`：部署根目录，例如 `/var/www/qiaoya-community-frontend`
- `DEPLOY_PUBLIC_URL`：（可选）对外访问地址，用于 Actions environment 显示。建议放在 Actions Variables（非 Secrets）：Settings → Secrets and variables → Actions → Variables。

Node 版本如无特殊要求，使用 Node 20。若有 `.nvmrc` 可在工作流中读取。

## 服务器准备
1) 目录结构（首次）：
```
sudo mkdir -p /var/www/qiaoya-community-frontend/{releases,shared}
sudo chown -R <deploy-user>:<deploy-user> /var/www/qiaoya-community-frontend
```

2) Nginx 示例（静态托管）：
```
server {
  listen 80;
  server_name dev.example.com;  # 替换为你的域名

  root /var/www/qiaoya-community-frontend/current;  # 指向 current 软链
  index index.html;

  location / {
    try_files $uri /index.html;  # SPA 路由回退
  }

  # 可选：后端 API 代理（vite 开发时已用 /api 代理，这里是生产）
  # location /api/ {
  #   proxy_pass http://127.0.0.1:8520;
  # }
}
```
测试并重载：`nginx -t && sudo systemctl reload nginx`

3) SSH 免密：将部署私钥的公钥添加到服务器 `~/.ssh/authorized_keys`。

## 工作流文件
将以下文件添加至仓库：`.github/workflows/deploy-dev.yml`

主要步骤：
- checkout → setup-node → npm ci → npm run build
- 将 `dist/` 上传至服务器 `releases/<timestamp>`
- 原子切换 `current` 软链，清理旧版本

完整示例见仓库内同名文件；关键片段如下（仅供预览）：
```yaml
name: Deploy Dev

on:
  push:
    branches: ["dev"]
  pull_request:
    types: [closed]
    branches: ["dev"]
  workflow_dispatch: {}

concurrency:
  group: dev-deploy
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.pull_request.merged == true)
    environment:
      name: dev
      url: ${{ vars.DEPLOY_PUBLIC_URL }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build

      # 可选：将主机加入 known_hosts，减少首次连接交互
      - name: Add known_hosts
        run: |
          ssh-keyscan -p "${{ secrets.SSH_PORT || 22 }}" ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Upload dist to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT || 22 }}
          source: "dist/*"
          target: "${{ secrets.DEPLOY_BASE_DIR }}/releases/${{ github.run_id }}-${{ github.run_number }}"

      - name: Activate release and cleanup
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT || 22 }}
          script: |
            set -euo pipefail
            BASE_DIR="${{ secrets.DEPLOY_BASE_DIR }}"
            RELEASES_DIR="$BASE_DIR/releases"
            CURRENT_LINK="$BASE_DIR/current"
            NEW_RELEASE="$RELEASES_DIR/${{ github.run_id }}-${{ github.run_number }}"
            # 确保 dist 位于发布根，而非 dist/dist
            if [ -d "$NEW_RELEASE/dist" ]; then mv "$NEW_RELEASE/dist"/* "$NEW_RELEASE" && rmdir "$NEW_RELEASE/dist" || true; fi
            ln -sfn "$NEW_RELEASE" "$CURRENT_LINK"
            # 保留最近 5 个版本
            cd "$RELEASES_DIR"
            ls -1t | tail -n +6 | xargs -r rm -rf
            # 静态资源一般无需重启服务；如有 Node 服务可在此 pm2 reload
```

## 回滚流程
- 方式 A（最快）：SSH 登录服务器，将 `current` 指回上一个版本：
  ```
  cd $DEPLOY_BASE_DIR/releases
  ls -1t   # 找到上一个版本目录名
  ln -sfn <prev-release> ../current
  ```
- 方式 B：在 Actions 手动触发 `workflow_dispatch`，指定回滚目标（如后续加输入参数）。

## 常见问题
- PR 合并没触发？请确认合并目标分支是 `dev`，且工作流 `on.push.branches` 包含 `dev`。
- 无法 SSH 连接：检查 `SSH_HOST/USER/PORT`、防火墙、私钥格式（建议 OpenSSH 格式）、公钥已加入 `authorized_keys`。
- 上传后访问 404：确认 Nginx `root` 指向 `.../current`，且 `try_files $uri /index.html;` 已配置。
- 构建失败：检查 Node 版本、`npm ci` 锁定一致性、国内网络可考虑加镜像源（尽量在私有 runner 使用）。

## 可选：仅在“PR 合并到 dev”触发
若团队禁止直接 push 到 dev，并希望严格仅在合并 PR 后触发，可移除 `push` 触发，仅保留 `pull_request`（closed + merged）与 `workflow_dispatch`。

---
## 执行清单（一步步完成）

1) 分支与流程确认
- [ ] 确认 `dev` 为开发环境部署目标分支，PR 合并到 `dev` 或直接 push 到 `dev` 都需要部署。
- [ ] 团队共识：如禁止直接 push 到 `dev`，保留本工作流的 PR 合并触发；如允许 push，也可保持双触发（当前默认）。

2) 服务器准备与权限
- [ ] 在服务器上创建部署根目录（示例为 `/var/www/qiaoya-community-frontend`）：
  ```bash
  sudo mkdir -p /var/www/qiaoya-community-frontend/{releases,shared}
  sudo chown -R <deploy-user>:<deploy-user> /var/www/qiaoya-community-frontend
  ```
- [ ] 确保 80/443 对外开放（云厂商安全组 + 服务器防火墙），22 端口允许 GitHub Actions 所在网络访问（或使用自托管 Runner）。

3) Nginx 配置静态站点
- [ ] 添加站点配置，`root` 指向 `.../current`，并启用 SPA 回退：
  ```nginx
  server {
    listen 80;
    server_name dev.example.com;  # 替换为你的域名

    root /var/www/qiaoya-community-frontend/current;
    index index.html;

    location / {
      try_files $uri /index.html;
    }

    # 如需代理后端 API：
  # location /api/ {
  #   proxy_pass http://127.0.0.1:8520;
  # }
  }
  ```
- [ ] 验证并重载：`sudo nginx -t && sudo systemctl reload nginx`

4) 创建部署专用 SSH 凭据
- [ ] 在本地或安全环境生成专用密钥对（推荐 Ed25519）：
  ```bash
  ssh-keygen -t ed25519 -C "github-actions qy-frontend" -f ~/.ssh/qy-frontend-deploy
  ```
- [ ] 将生成的公钥内容（`~/.ssh/qy-frontend-deploy.pub`）追加到服务器目标用户的 `~/.ssh/authorized_keys`。
- [ ] 使用私钥本地测试连通性：
  ```bash
  ssh -i ~/.ssh/qy-frontend-deploy -p <SSH_PORT> <SSH_USER>@<SSH_HOST> "echo ok"
  ```

5) 配置 GitHub 仓库 Secrets（Settings → Secrets and variables → Actions）
- [ ] `SSH_HOST`：服务器 IP 或域名
- [ ] `SSH_USER`：部署用户（与授权公钥的用户一致）
- [ ] `SSH_PRIVATE_KEY`：将私钥文件的完整内容原样粘贴（包含 `-----BEGIN OPENSSH PRIVATE KEY-----` 到 `-----END...`）
- [ ] `SSH_PORT`：端口号（默认 22，可不填）
- [ ] `DEPLOY_BASE_DIR`：如 `/var/www/qiaoya-community-frontend`
- [ ] `DEPLOY_PUBLIC_URL`：（可选）对外访问地址，Actions 环境页展示用（建议设为 Actions Variables，而非 Secrets）

  查看并复制私钥内容（用于粘贴到 `SSH_PRIVATE_KEY`）
  - 默认路径（按上文示例）：`~/.ssh/qy-frontend-deploy`
  - 通用查看（复制整段，含 BEGIN/END 行与换行）：
    ```bash
    cat ~/.ssh/qy-frontend-deploy
    ```
  - 快速复制到剪贴板：
    - macOS：`pbcopy < ~/.ssh/qy-frontend-deploy`
    - Linux（X11）：`xclip -selection clipboard < ~/.ssh/qy-frontend-deploy`
    - Linux（Wayland）：`wl-copy < ~/.ssh/qy-frontend-deploy`
    - Windows（PowerShell）：
      ```powershell
      Get-Content $env:USERPROFILE\.ssh\qy-frontend-deploy | Set-Clipboard
      ```
  - 注意：
    - 粘贴的是私钥本体（无 `.pub` 后缀），第一行应为 `-----BEGIN OPENSSH PRIVATE KEY-----`。
    - 若私钥设置了口令，需额外添加一个 Secret（如 `SSH_PASSPHRASE`），并在工作流的 `appleboy/*` 步骤里配置 `passphrase: ${{ secrets.SSH_PASSPHRASE }}`。

6) 校验工作流配置
- [ ] 确认仓库存在文件：`.github/workflows/deploy-dev.yml`
- [ ] Node 版本默认为 20；如需对齐自定义 `.nvmrc`，可在工作流中调整 `actions/setup-node`。
- [ ] 构建命令来自 `package.json` 的 `build` 脚本：`npm run build`；如需自定义环境变量，请在构建前 `echo "NAME=VALUE" >> $GITHUB_ENV`。
- [ ] 如果生产部署路径非站点根（例如 `https://dev.example.com/frontend/`），需要在 `vite.config.ts` 设置 `base: '/frontend/'`，确保资源路径正确。

7) 首次手动执行部署（验证全链路）
- [ ] 打开 GitHub 仓库 → Actions → 选择 "Deploy Dev" → "Run workflow"。
- [ ] 观察日志：应依次完成 `Install deps`、`Build`、`Upload dist to server`、`Activate release and cleanup`。
- [ ] 服务器检查：
  ```bash
  ls -l /var/www/qiaoya-community-frontend
  # 应看到 current -> releases/<run_id-run_number> 的软链
  ls -l /var/www/qiaoya-community-frontend/releases | head
  ```

8) 验证访问与路由
- [ ] 通过浏览器访问 `DEPLOY_PUBLIC_URL`（或你的 Nginx 域名），页面可正常加载。
- [ ] 手动刷新一个非根路径的前端路由（例如 `/dashboard`），验证 `try_files` 生效不 404。

9) 正式联通 CI 触发
- [ ] 向 `dev` 分支推送一次提交，或合并一个 PR 到 `dev`，检查 Actions 自动触发与部署结果。

10) 回滚演练（建议在非业务高峰操作）
- [ ] 登录服务器，查看版本目录按时间倒序：
  ```bash
  cd /var/www/qiaoya-community-frontend/releases
  ls -1t
  ```
- [ ] 将 `current` 指回上一个版本：
  ```bash
  ln -sfn <prev-release-dir> ../current
  ```
- [ ] 刷新页面验证回滚生效。若有 CDN/代理，按需清缓存。

11) 常见异常与排查
- 构建失败：检查 Node 版本、锁文件一致性（使用 `npm ci`）、第三方源连通性。
- SSH 失败：核对 `SSH_*` Secrets、服务器防火墙、私钥是否为 OpenSSH 格式、是否包含多行且未转义。
- 权限问题：确保 `DEPLOY_BASE_DIR` 对部署用户可写；如需，`sudo chown -R <deploy-user>:<deploy-user> <DEPLOY_BASE_DIR>`。
- 站点 404 或白屏：确认 Nginx `root` 指向 `.../current`，并已配置 `try_files $uri /index.html;`；检查 `vite.config.ts` 的 `base` 是否匹配部署路径。
- 静态缓存问题：变更不生效时，清浏览器缓存或 CDN 缓存；可在构建产物中开启指纹（Vite 默认带有）。

12) 可选优化
- 使用自托管 Runner（私有网络部署、更快依赖下载）。
- 以 `rsync` 方式上传（仅增量变更），可替换为 `appleboy/ssh-action` + `rsync` 命令。
- 调整保留版本数（默认 5 个）：修改工作流中清理命令 `tail -n +6`。
