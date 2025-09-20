package org.xhy.community.infrastructure.exception;

public enum SecurityErrorCode implements ErrorCode {
    FORBIDDEN(403, "权限不足"),
    UNAUTHORIZED(401, "未登录");

    private final int code;
    private final String message;

    SecurityErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}

