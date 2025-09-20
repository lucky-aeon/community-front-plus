package org.xhy.community.domain.permission.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import org.xhy.community.domain.permission.entity.SubscriptionPlanPermissionEntity;

@Mapper
@Repository
public interface SubscriptionPlanPermissionRepository extends BaseMapper<SubscriptionPlanPermissionEntity> {
}

