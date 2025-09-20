package org.xhy.community.application.subscription.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.xhy.community.domain.permission.entity.SubscriptionPlanMenuEntity;
import org.xhy.community.domain.permission.repository.SubscriptionPlanMenuRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminSubscriptionPlanMenuAppService {

    private final SubscriptionPlanMenuRepository subscriptionPlanMenuRepository;

    public AdminSubscriptionPlanMenuAppService(SubscriptionPlanMenuRepository subscriptionPlanMenuRepository) {
        this.subscriptionPlanMenuRepository = subscriptionPlanMenuRepository;
    }

    public List<String> getSubscriptionPlanMenuKeys(String planId) {
        List<SubscriptionPlanMenuEntity> list = subscriptionPlanMenuRepository.selectList(
            new LambdaQueryWrapper<SubscriptionPlanMenuEntity>()
                .eq(SubscriptionPlanMenuEntity::getSubscriptionPlanId, planId)
        );
        if (CollectionUtils.isEmpty(list)) return Collections.emptyList();
        return list.stream().map(SubscriptionPlanMenuEntity::getMenuId).collect(Collectors.toList());
    }

    public void updateSubscriptionPlanMenus(String planId, List<String> menuKeys) {
        // 清空原有绑定（逻辑删除）
        subscriptionPlanMenuRepository.delete(
            new LambdaQueryWrapper<SubscriptionPlanMenuEntity>()
                .eq(SubscriptionPlanMenuEntity::getSubscriptionPlanId, planId)
        );
        if (CollectionUtils.isEmpty(menuKeys)) {
            return;
        }
        for (String key : menuKeys) {
            SubscriptionPlanMenuEntity e = new SubscriptionPlanMenuEntity(planId, key);
            subscriptionPlanMenuRepository.insert(e);
        }
    }
}

