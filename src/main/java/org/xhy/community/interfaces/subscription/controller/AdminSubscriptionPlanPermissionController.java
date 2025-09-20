package org.xhy.community.interfaces.subscription.controller;

import org.springframework.web.bind.annotation.*;
import org.xhy.community.application.subscription.service.AdminSubscriptionPlanPermissionAppService;
import org.xhy.community.infrastructure.config.ApiResponse;
import org.xhy.community.interfaces.subscription.request.UpdateSubscriptionPlanPermissionsRequest;

import java.util.List;

/**
 * 管理员：套餐权限码绑定（接口/菜单等通用权限码）
 */
@RestController
@RequestMapping("/api/admin/subscription-plan-permissions")
public class AdminSubscriptionPlanPermissionController {

    private final AdminSubscriptionPlanPermissionAppService adminSubscriptionPlanPermissionAppService;

    public AdminSubscriptionPlanPermissionController(AdminSubscriptionPlanPermissionAppService adminSubscriptionPlanPermissionAppService) {
        this.adminSubscriptionPlanPermissionAppService = adminSubscriptionPlanPermissionAppService;
    }

    @GetMapping("/{planId}/permission-codes")
    public ApiResponse<List<String>> getSubscriptionPlanPermissionCodes(@PathVariable String planId) {
        return ApiResponse.success(adminSubscriptionPlanPermissionAppService.getSubscriptionPlanPermissionCodes(planId));
    }

    @PutMapping("/{planId}")
    public ApiResponse<Void> updateSubscriptionPlanPermissions(@PathVariable String planId,
                                                               @RequestBody UpdateSubscriptionPlanPermissionsRequest request) {
        adminSubscriptionPlanPermissionAppService.updateSubscriptionPlanPermissions(planId,
            request != null ? request.getPermissionCodes() : null);
        return ApiResponse.success();
    }
}

