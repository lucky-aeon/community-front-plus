package org.xhy.community.interfaces.subscription.request;

import java.util.List;

/**
 * 更新套餐菜单绑定请求
 * - 传入 menuKeys：全量替换为这些菜单键
 * - 传入空列表或 null：清空绑定
 */
public class UpdateSubscriptionPlanMenusRequest {
    private List<String> menuKeys;

    public UpdateSubscriptionPlanMenusRequest() {}

    public List<String> getMenuKeys() { return menuKeys; }
    public void setMenuKeys(List<String> menuKeys) { this.menuKeys = menuKeys; }
}

