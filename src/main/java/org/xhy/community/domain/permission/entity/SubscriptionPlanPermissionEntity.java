package org.xhy.community.domain.permission.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.xhy.community.domain.common.entity.BaseEntity;

/**
 * 套餐-权限码 关联实体
 * 表：subscription_plan_permissions
 */
@TableName("subscription_plan_permissions")
public class SubscriptionPlanPermissionEntity extends BaseEntity {
    private String subscriptionPlanId;
    private String permissionCode;

    public SubscriptionPlanPermissionEntity() {}

    public SubscriptionPlanPermissionEntity(String subscriptionPlanId, String permissionCode) {
        this.subscriptionPlanId = subscriptionPlanId;
        this.permissionCode = permissionCode;
    }

    public String getSubscriptionPlanId() { return subscriptionPlanId; }
    public void setSubscriptionPlanId(String subscriptionPlanId) { this.subscriptionPlanId = subscriptionPlanId; }

    public String getPermissionCode() { return permissionCode; }
    public void setPermissionCode(String permissionCode) { this.permissionCode = permissionCode; }
}

