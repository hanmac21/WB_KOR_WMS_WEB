package com.example.demo.security;

public final class AuthContext {

    private AuthContext() {}

    private static final ThreadLocal<Boolean> CAN_DML = new ThreadLocal<>();

    public static void setCanDml(Boolean canDml) {
        CAN_DML.set(canDml);
    }

    public static boolean canDml() {
        Boolean v = CAN_DML.get();
        return v != null && v;
    }

    public static void clear() {
        CAN_DML.remove();
    }
}
