CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    permission_code VARCHAR(128) NOT NULL,
    op VARCHAR(10) NOT NULL, -- GRANT / REVOKE
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

-- 表注释
COMMENT ON TABLE user_permission_overrides IS '用户权限覆盖（补丁），支持对权限码进行授予或剔除';

-- 列注释
COMMENT ON COLUMN user_permission_overrides.user_id IS '用户ID';
COMMENT ON COLUMN user_permission_overrides.permission_code IS '权限码';
COMMENT ON COLUMN user_permission_overrides.op IS '操作类型：GRANT/REVOKE';
COMMENT ON COLUMN user_permission_overrides.create_time IS '创建时间';
COMMENT ON COLUMN user_permission_overrides.update_time IS '更新时间';
COMMENT ON COLUMN user_permission_overrides.deleted IS '逻辑删除标记';

-- 约束与索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_perm ON user_permission_overrides(user_id, permission_code) WHERE deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_perm_code ON user_permission_overrides(permission_code) WHERE deleted = FALSE;

