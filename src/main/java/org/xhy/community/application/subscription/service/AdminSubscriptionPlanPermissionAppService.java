package org.xhy.community.application.subscription.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.xhy.community.domain.permission.entity.SubscriptionPlanPermissionEntity;
import org.xhy.community.domain.permission.repository.SubscriptionPlanPermissionRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminSubscriptionPlanPermissionAppService {

    private final SubscriptionPlanPermissionRepository subscriptionPlanPermissionRepository;

    public AdminSubscriptionPlanPermissionAppService(SubscriptionPlanPermissionRepository subscriptionPlanPermissionRepository) {
        this.subscriptionPlanPermissionRepository = subscriptionPlanPermissionRepository;
    }

    public List<String> getSubscriptionPlanPermissionCodes(String planId) {
        List<SubscriptionPlanPermissionEntity> list = subscriptionPlanPermissionRepository.selectList(
            new LambdaQueryWrapper<SubscriptionPlanPermissionEntity>()
                .eq(SubscriptionPlanPermissionEntity::getSubscriptionPlanId, planId)
        );
        if (CollectionUtils.isEmpty(list)) return Collections.emptyList();
        return list.stream().map(SubscriptionPlanPermissionEntity::getPermissionCode).collect(Collectors.toList());
    }

    public void updateSubscriptionPlanPermissions(String planId, List<String> permissionCodes) {
        subscriptionPlanPermissionRepository.delete(
            new LambdaQueryWrapper<SubscriptionPlanPermissionEntity>()
                .eq(SubscriptionPlanPermissionEntity::getSubscriptionPlanId, planId)
        );
        if (CollectionUtils.isEmpty(permissionCodes)) {
            return;
        }
        for (String code : permissionCodes) {
            SubscriptionPlanPermissionEntity e = new SubscriptionPlanPermissionEntity(planId, code);
            subscriptionPlanPermissionRepository.insert(e);
        }
    }
}

