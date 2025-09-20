package org.xhy.community.infrastructure.security;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.xhy.community.application.permission.service.PermissionAggregationAppService;
import org.xhy.community.infrastructure.config.UserContext;
import org.xhy.community.infrastructure.exception.AuthorizationException;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Aspect
@Component
public class PermissionAspect {

    private final PermissionAggregationAppService aggregationAppService;

    public PermissionAspect(PermissionAggregationAppService aggregationAppService) {
        this.aggregationAppService = aggregationAppService;
    }

    @Around("@annotation(requirePermissions)")
    public Object check(ProceedingJoinPoint pjp, RequirePermissions requirePermissions) throws Throwable {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            throw new AuthorizationException("未登录");
        }
        Set<String> userPerms = new HashSet<>(aggregationAppService.aggregate(userId).getPermissions());
        String[] required = requirePermissions.value();
        boolean ok = requirePermissions.mode() == RequirePermissions.Mode.ALL
                ? Arrays.stream(required).allMatch(userPerms::contains)
                : Arrays.stream(required).anyMatch(userPerms::contains);
        if (!ok) {
            throw new AuthorizationException("权限不足");
        }
        return pjp.proceed();
    }
}
