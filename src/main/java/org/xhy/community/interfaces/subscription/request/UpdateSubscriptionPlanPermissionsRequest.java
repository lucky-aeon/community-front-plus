package org.xhy.community.interfaces.subscription.request;

import java.util.List;

/**
 * 更新套餐权限码绑定请求
 * - 传入 permissionCodes：全量替换为这些权限码
 * - 传入空列表或 null：清空绑定
 */
public class UpdateSubscriptionPlanPermissionsRequest {
    private List<String> permissionCodes;

    public UpdateSubscriptionPlanPermissionsRequest() {}

    public List<String> getPermissionCodes() { return permissionCodes; }
    public void setPermissionCodes(List<String> permissionCodes) { this.permissionCodes = permissionCodes; }
}

