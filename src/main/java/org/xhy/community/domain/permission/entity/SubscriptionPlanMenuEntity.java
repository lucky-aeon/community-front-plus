package org.xhy.community.domain.permission.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.xhy.community.domain.common.entity.BaseEntity;

/**
 * 套餐-菜单 关联实体
 * 对应表：subscription_plan_menus
 * 说明：字段 menuId 可复用为 menuKey（如 dashboard.courses / admin.users）
 */
@TableName("subscription_plan_menus")
public class SubscriptionPlanMenuEntity extends BaseEntity {

    private String subscriptionPlanId;
    private String menuId; // 实际可存前端菜单key

    public SubscriptionPlanMenuEntity() {}

    public SubscriptionPlanMenuEntity(String subscriptionPlanId, String menuId) {
        this.subscriptionPlanId = subscriptionPlanId;
        this.menuId = menuId;
    }

    public String getSubscriptionPlanId() { return subscriptionPlanId; }
    public void setSubscriptionPlanId(String subscriptionPlanId) { this.subscriptionPlanId = subscriptionPlanId; }

    public String getMenuId() { return menuId; }
    public void setMenuId(String menuId) { this.menuId = menuId; }
}

