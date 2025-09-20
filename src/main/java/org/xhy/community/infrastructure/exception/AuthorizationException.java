package org.xhy.community.infrastructure.exception;

/**
 * 简单的权限异常（不依赖通用异常体系），用于AOP鉴权失败抛出
 */
public class AuthorizationException extends RuntimeException {
    public AuthorizationException(String message) {
        super(message);
    }
}
