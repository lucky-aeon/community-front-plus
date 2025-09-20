package org.xhy.community.infrastructure.exception;

public class AuthorizationException extends BaseException {
    public AuthorizationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AuthorizationException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}

