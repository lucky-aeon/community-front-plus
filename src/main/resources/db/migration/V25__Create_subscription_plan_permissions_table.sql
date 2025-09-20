CREATE TABLE IF NOT EXISTS subscription_plan_permissions (
    id VARCHAR(36) PRIMARY KEY,
    subscription_plan_id VARCHAR(36) NOT NULL,
    permission_code VARCHAR(128) NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

-- 表注释
COMMENT ON TABLE subscription_plan_permissions IS '套餐-权限码关联表，绑定接口/菜单/通用权限码';

-- 列注释
COMMENT ON COLUMN subscription_plan_permissions.subscription_plan_id IS '套餐ID';
COMMENT ON COLUMN subscription_plan_permissions.permission_code IS '权限码, 如 api:get:admin.users / menu:access:dashboard.courses';
COMMENT ON COLUMN subscription_plan_permissions.create_time IS '创建时间';
COMMENT ON COLUMN subscription_plan_permissions.update_time IS '更新时间';
COMMENT ON COLUMN subscription_plan_permissions.deleted IS '逻辑删除标记';

-- 约束与索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_plan_perm ON subscription_plan_permissions(subscription_plan_id, permission_code) WHERE deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_perm_code ON subscription_plan_permissions(permission_code) WHERE deleted = FALSE;

