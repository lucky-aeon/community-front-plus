package org.xhy.community.application.permission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.xhy.community.application.user.dto.UserDTO;
import org.xhy.community.domain.permission.entity.SubscriptionPlanMenuEntity;
import org.xhy.community.domain.permission.entity.SubscriptionPlanPermissionEntity;
import org.xhy.community.domain.permission.entity.UserPermissionOverrideEntity;
import org.xhy.community.domain.permission.repository.SubscriptionPlanMenuRepository;
import org.xhy.community.domain.permission.repository.SubscriptionPlanPermissionRepository;
import org.xhy.community.domain.permission.repository.UserPermissionOverrideRepository;
import org.xhy.community.domain.subscription.entity.SubscriptionPlanCourseEntity;
import org.xhy.community.domain.subscription.entity.UserSubscriptionEntity;
import org.xhy.community.domain.subscription.repository.SubscriptionPlanCourseRepository;
import org.xhy.community.domain.subscription.repository.UserSubscriptionRepository;
import org.xhy.community.domain.subscription.valueobject.SubscriptionStatus;
import org.xhy.community.domain.user.service.UserDomainService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 权益聚合服务：根据用户有效订阅、个人课程、套餐菜单与权限码、用户覆盖，计算最终可用权限
 */
@Service
public class PermissionAggregationAppService {

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final SubscriptionPlanCourseRepository subscriptionPlanCourseRepository;
    private final SubscriptionPlanMenuRepository subscriptionPlanMenuRepository;
    private final SubscriptionPlanPermissionRepository subscriptionPlanPermissionRepository;
    private final UserPermissionOverrideRepository userPermissionOverrideRepository;
    private final UserDomainService userDomainService;

    public PermissionAggregationAppService(UserSubscriptionRepository userSubscriptionRepository,
                                           SubscriptionPlanCourseRepository subscriptionPlanCourseRepository,
                                           SubscriptionPlanMenuRepository subscriptionPlanMenuRepository,
                                           SubscriptionPlanPermissionRepository subscriptionPlanPermissionRepository,
                                           UserPermissionOverrideRepository userPermissionOverrideRepository,
                                           UserDomainService userDomainService) {
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.subscriptionPlanCourseRepository = subscriptionPlanCourseRepository;
        this.subscriptionPlanMenuRepository = subscriptionPlanMenuRepository;
        this.subscriptionPlanPermissionRepository = subscriptionPlanPermissionRepository;
        this.userPermissionOverrideRepository = userPermissionOverrideRepository;
        this.userDomainService = userDomainService;
    }

    /**
     * 计算用户权益
     */
    public UserDTO.Entitlements aggregate(String userId) {
        Set<String> permissions = new HashSet<>();
        Set<String> courseIds = new HashSet<>();
        Set<String> menuKeys = new HashSet<>();

        // 1) 有效订阅
        List<UserSubscriptionEntity> activeSubs = getActiveSubscriptions(userId);
        Set<String> planIds = activeSubs.stream().map(UserSubscriptionEntity::getSubscriptionPlanId).collect(Collectors.toSet());

        // 2) 课程：订阅 + 个人直接拥有
        if (!planIds.isEmpty()) {
            List<SubscriptionPlanCourseEntity> pcs = subscriptionPlanCourseRepository.selectList(
                new LambdaQueryWrapper<SubscriptionPlanCourseEntity>()
                    .in(SubscriptionPlanCourseEntity::getSubscriptionPlanId, planIds)
            );
            pcs.forEach(x -> courseIds.add(x.getCourseId()));
        }
        userDomainService.getUserCourses(userId).forEach(courseIds::add);

        // 3) 菜单：订阅绑定的菜单键（menuId 字段存放 menuKey）
        if (!planIds.isEmpty()) {
            List<SubscriptionPlanMenuEntity> pms = subscriptionPlanMenuRepository.selectList(
                new LambdaQueryWrapper<SubscriptionPlanMenuEntity>()
                    .in(SubscriptionPlanMenuEntity::getSubscriptionPlanId, planIds)
            );
            pms.forEach(x -> menuKeys.add(x.getMenuId()));
        }

        // 4) 通用权限码：订阅绑定
        if (!planIds.isEmpty()) {
            List<SubscriptionPlanPermissionEntity> pps = subscriptionPlanPermissionRepository.selectList(
                new LambdaQueryWrapper<SubscriptionPlanPermissionEntity>()
                    .in(SubscriptionPlanPermissionEntity::getSubscriptionPlanId, planIds)
            );
            pps.forEach(x -> permissions.add(x.getPermissionCode()));
        }

        // 5) 将课程ID折叠为权限码 course:view:<id>
        courseIds.forEach(id -> permissions.add("course:view:" + id));

        // 6) 用户覆盖（GRANT/REVOKE）
        List<UserPermissionOverrideEntity> overrides = userPermissionOverrideRepository.selectList(
            new LambdaQueryWrapper<UserPermissionOverrideEntity>()
                .eq(UserPermissionOverrideEntity::getUserId, userId)
        );
        for (UserPermissionOverrideEntity o : overrides) {
            if ("GRANT".equalsIgnoreCase(o.getOp())) permissions.add(o.getPermissionCode());
            else if ("REVOKE".equalsIgnoreCase(o.getOp())) permissions.remove(o.getPermissionCode());
        }

        return new UserDTO.Entitlements(
            new ArrayList<>(permissions),
            new ArrayList<>(courseIds),
            new ArrayList<>(menuKeys),
            LocalDateTime.now()
        );
    }

    private List<UserSubscriptionEntity> getActiveSubscriptions(String userId) {
        LocalDateTime now = LocalDateTime.now();
        return userSubscriptionRepository.selectList(
            new LambdaQueryWrapper<UserSubscriptionEntity>()
                .eq(UserSubscriptionEntity::getUserId, userId)
                .eq(UserSubscriptionEntity::getStatus, SubscriptionStatus.ACTIVE)
                .le(UserSubscriptionEntity::getStartTime, now)
                .ge(UserSubscriptionEntity::getEndTime, now)
        );
    }
}

