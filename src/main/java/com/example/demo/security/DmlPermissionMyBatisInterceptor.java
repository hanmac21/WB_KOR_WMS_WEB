package com.example.demo.security;

import java.util.Properties;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.SqlCommandType;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;

import com.example.demo.exception.ForbiddenException;

import lombok.extern.slf4j.Slf4j;

@Intercepts({
    @Signature(type = Executor.class, method = "update", args = { MappedStatement.class, Object.class })
})
@Slf4j
public class DmlPermissionMyBatisInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        MappedStatement ms = (MappedStatement) invocation.getArgs()[0];

        log.info("✅ [DML-INTERCEPTOR] id={}, type={}, canDml={}",
                ms.getId(), ms.getSqlCommandType(), AuthContext.canDml());

        if ((ms.getSqlCommandType() == SqlCommandType.INSERT
                || ms.getSqlCommandType() == SqlCommandType.UPDATE
                || ms.getSqlCommandType() == SqlCommandType.DELETE)
                && !AuthContext.canDml()) {
            throw new ForbiddenException("DML 권한이 없습니다: " + ms.getId());
        }

        return invocation.proceed();
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
        // no-op
    }
}
