package org.xhy.community.interfaces.subscription.controller;

import org.springframework.web.bind.annotation.*;
import org.xhy.community.application.subscription.service.AdminSubscriptionPlanMenuAppService;
import org.xhy.community.infrastructure.config.ApiResponse;
import org.xhy.community.interfaces.subscription.request.UpdateSubscriptionPlanMenusRequest;

import java.util.List;

/**
 * 管理员：套餐菜单绑定
 */
@RestController
@RequestMapping("/api/admin/subscription-plan-menus")
public class AdminSubscriptionPlanMenuController {

    private final AdminSubscriptionPlanMenuAppService adminSubscriptionPlanMenuAppService;

    public AdminSubscriptionPlanMenuController(AdminSubscriptionPlanMenuAppService adminSubscriptionPlanMenuAppService) {
        this.adminSubscriptionPlanMenuAppService = adminSubscriptionPlanMenuAppService;
    }

    @GetMapping("/{planId}/menu-keys")
    public ApiResponse<List<String>> getSubscriptionPlanMenuKeys(@PathVariable String planId) {
        return ApiResponse.success(adminSubscriptionPlanMenuAppService.getSubscriptionPlanMenuKeys(planId));
    }

    @PutMapping("/{planId}")
    public ApiResponse<Void> updateSubscriptionPlanMenus(@PathVariable String planId,
                                                         @RequestBody UpdateSubscriptionPlanMenusRequest request) {
        adminSubscriptionPlanMenuAppService.updateSubscriptionPlanMenus(planId,
            request != null ? request.getMenuKeys() : null);
        return ApiResponse.success();
    }
}

