package com.JavaProjcet.Vetcare.entity;


public enum PaymentMethod {
    COD("Cash on Delivery"),
    DIGITAL("Digital Payment");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
