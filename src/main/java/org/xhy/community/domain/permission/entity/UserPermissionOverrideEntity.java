package org.xhy.community.domain.permission.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.xhy.community.domain.common.entity.BaseEntity;

/**
 * 用户权限覆盖（加权/剔除）实体
 * 对应表：user_permission_overrides
 */
@TableName("user_permission_overrides")
public class UserPermissionOverrideEntity extends BaseEntity {

    private String userId;
    private String permissionCode;
    /**
     * 操作：GRANT / REVOKE
     */
    private String op;

    public UserPermissionOverrideEntity() {}

    public UserPermissionOverrideEntity(String userId, String permissionCode, String op) {
        this.userId = userId;
        this.permissionCode = permissionCode;
        this.op = op;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPermissionCode() { return permissionCode; }
    public void setPermissionCode(String permissionCode) { this.permissionCode = permissionCode; }

    public String getOp() { return op; }
    public void setOp(String op) { this.op = op; }
}

