# 前端提示与错误处理规范（Toast/拦截器）

本项目统一通过 Axios 响应拦截器弹出提示；组件层不再对 Axios 请求失败重复弹窗。请严格遵守以下规则。

## 统一规则

- 统一入口：`src/shared/services/api/config.ts` 中的 Axios 实例与响应拦截器。
  - 成功：只要响应体 `message` 非空字符串，统一 `showToast.success(message)`。
    - 后端负责控制 message 的出现与频率，前端「无脑接收 message」。
  - 失败：根据 HTTP 状态码统一提示：
    - 403 → 一律提示 `权限不足`（禁止覆盖为其它文案）。
    - 401 → 清理本地会话并提示登录过期。
    - 400/404/500/其他 → 优先显示后端 `data.message`，否则显示默认兜底文案。

- 组件层禁止对 Axios 请求失败再手动弹 toast（包括通用“xxx失败/加载失败/提交失败”）。
  - 组件的 `catch` 中仅做：状态还原、日志 `console.error`、UI 收尾，不弹错误 toast。
  - 如需成功提示，依赖后端在响应里返回 `message`，组件不重复弹。

## 组件允许自行弹 toast 的场景

- 本地校验与交互类错误（非网络）：
  - 输入校验不通过、必填项缺失、客户端计算失败、复制到剪贴板失败等。
  - 示例：`showToast.error('请输入版本号')`、`showToast.error('排序权重必须是非负整数')`。

- 非 Axios 的网络调用（不会经过拦截器）：
  - `fetch` / `XMLHttpRequest` 的场景需要组件或封装处自己处理提示。
  - 参考：`src/shared/services/api/resource-access.service.ts`、`src/shared/services/api/aliyun-upload.service.ts`。

## 示例

- 正确（Axios 失败交给拦截器）：

```
try {
  await SomeService.update(params);
  // 成功提示由后端 message 控制，拦截器统一弹出
} catch (e) {
  console.error('更新失败', e); // 不在这里 showToast.error
}
```

- 正确（本地表单校验）：

```
if (!form.title) {
  showToast.error('请输入标题');
  return;
}
```

## 迁移与自检

- 在提交前检查是否存在重复错误提示：
  - `rg -n "showToast\.error\(" src`
  - 对于 Axios 请求失败的分支，移除组件内的错误 toast。

## 参考文件

- Axios 配置与拦截器：`src/shared/services/api/config.ts`
- 成功/错误 toast 封装：`src/shared/utils/toast.ts`
- 典型组件（已按规范实现，可参考写法）：
  - 用户端：`src/apps/user-backend/components/MyTestimonialPage.tsx`
  - 管理端：`src/apps/admin-backend/components/TestimonialsPage.tsx`
  - 公共评论组件：`src/shared/components/ui/Comments.tsx`

