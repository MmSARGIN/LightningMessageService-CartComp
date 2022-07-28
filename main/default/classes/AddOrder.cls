public with sharing class AddOrder {
    @AuraEnabled
    public static Cart_Order__c addNewOrder(String name, String lastname, String phone, String address, Integer cvv, String card, String orderdate, String orderid, Integer price){
            Cart_Order__c newOrder = New Cart_Order__c(
                Name = name,
                Lastname__c = lastname,
                Phone__c = phone,
                Address__c = address,
                CVV__c = cvv,
                Card_Number__C = card,
                Order_Date__c = orderdate,
                Order_ID__C = orderid,
                Price__c = price
            );
            insert newOrder;
            return newOrder;
           
        
    }
}
