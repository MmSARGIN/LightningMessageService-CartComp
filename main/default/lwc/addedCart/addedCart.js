import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import ADD_TO_CART from '@salesforce/messageChannel/Add_Cart__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addNewOrder from "@salesforce/apex/AddOrder.addNewOrder";
import makeGetCallout from '@salesforce/apex/StripeAPIHandler.makeGetCallout';
import Amount from '@salesforce/schema/Opportunity.Amount';

export default class AddedCart extends LightningElement {

//my var
    counter = 0;
    subscription = null;
    title;
    comingPrice = 0;
    price = 0;
    image;
    description;
    products;
    added = [];
    indexOfProduct;
    itemid;
    countProducts = 0;
    remainingNumber = 0;
    confirmForm = false;
    formName ='';
    formLastName = '';
    formPhone;
    formCard;
    formCVV;
    formObj;
    formDate;
    formAddress;
      //stripe var
      customerEmail = 'exampleCustomer@example.com';
      amount = 0;
      paymentMethodOne='card';
      paymentMethodTwo='klarna';
      customerID = '';
      currency = 'usd';
    
    @wire(MessageContext)
    messageContext;
    connectedCallback(){
        this.subscribeToMessageChannel();
    }
    
    subscribeToMessageChannel(){
        this.subscription = subscribe(
            this.messageContext,
            ADD_TO_CART,
            (message) => this.handleMessage(message)
        );
    }
    handleMessage(message){
        this.products = message.products;
        this.itemid = message.targetname.split("-")[0]; 
        if(message.operator === 'add'){
            this.countProducts += 1;
            this.added.push(this.products[message.targetname.split("-")[0] - 1]);
            this.price += this.products[parseInt(this.itemid - 1)].price;
            this.comingPrice = Math.round(this.price);
            const evt = new ShowToastEvent({
                    title: 'Success Add',
                    message: 'Your product has been added to the cart.',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
             } else if(message.operator === 'sub'){
            if(this.added.length > 0){
                for (let i = 0; i < this.added.length; i++) {
                    if(message.targetname.split("-")[0] == this.added[i].id){
                        this.indexOfProduct = i;
                    }
                     }
                     if(message.targetname.split("-")[0] == this.added[this.indexOfProduct].id){
                        this.price = this.price - this.products[parseInt(this.itemid - 1)].price;
                        this.comingPrice = Math.round(this.price);
                        this.added.splice(this.indexOfProduct, 1);
                        this.countProducts -= 1;
                        const evt = new ShowToastEvent({
                            title: 'Success Delete',
                            message: 'Your product has been removed from the cart.',
                            variant: 'error',
                            mode: 'dismissable'
                        });
                        this.dispatchEvent(evt);
                          }   
                 }
            }
    console.log("added :" ,this.added);
}

handleClick(){
    console.log('tiklandi');
    if(this.countProducts !== 0){
        this.confirmForm = !this.confirmForm;
    }else{
        const evt = new ShowToastEvent({
            title: 'Sepete Urun ekleyin',
            message: 'Bos gonderemezsiniz',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
   
}

handleChange(event){
    console.log(event.target.value);
    
    if(event.target.name === 'name'){
        this.formName = event.target.value;
    }else if(event.target.name === 'lastname'){
        this.formLastName = event.target.value;
    } else if(event.target.name === 'phone'){
        this.formPhone = event.target.value;
    }else if(event.target.name === 'card'){
        this.formCard = event.target.value;
    }else if(event.target.name === 'cvv'){
        this.formCVV = event.target.value;
    }else if(event.target.name === 'date'){
        this.formDate = event.target.value;
    }else if(event.target.name === 'address'){
        this.formAddress = event.target.value;
    }

     
}
async handleConfirm(){
    this.formObj ={
        Name : this.formName,
        LastName :this.formLastName,
        Phone : this.formPhone,
        CardNumber : this.formCard,
        CVV: this.formCVV,
        Date:this.formDate,
        Address:this.formAddress,     
        Date_Time:Date(),  
        Orders:this.added,
        Price:this.comingPrice,
        OrderId: Math.random()
    }
    if(this.formName !== '' && this.formLastName !== '' && this.formCard !== '' && this.formCVV !== ''){
        console.log(this.formObj)
        addNewOrder({
            name:this.formName,
            lastname: this.formLastName,
            phone:this.formPhone,
            address: this.formAddress,
            cvv:this.formCVV,
            card:this.formCard,
            orderdate:this.formObj.Date_Time,
            orderid: this.formObj.OrderId,
            price:this.formObj.Price

        })
        .then(res => console.log(res))
         //STRIPE
     //Get Customer
     this.amount = this.comingPrice;
     this.customerEmail = `${this.formName.toLowerCase() + this.formLastName.toLowerCase()}@salesforce.com`
     var customerID;
     var url = "https://api.stripe.com//v1/customers?email=" + this.customerEmail + "&limit=1";
     var method = 'GET';
     var urlencoded = new URLSearchParams();
     let pgetcustomer = await makeGetCallout({urlencoded:null,url:url, method:method});
     var getcustomer = JSON.parse(pgetcustomer);
     console.log('bakalim kanka',getcustomer)
     if (getcustomer.data.length >= 1){
         customerID = getcustomer.data[0].id
     }
     //Create Customer if no customer is found
     if (getcustomer.data.length == 0){
         var urlencoded = new URLSearchParams();
         urlencoded.append("email", this.customerEmail);
         var url = "https://api.stripe.com//v1/customers";
         var method = "POST";
         let pcreatecustomer = await makeGetCallout({urlencoded:urlencoded.toString(),url:url, method:method});
         var createcustomer = JSON.parse(pcreatecustomer);
         customerID = createcustomer.id
     }

     //Create link
     var urlencoded = new URLSearchParams();
     urlencoded.append("cancel_url", "https://www.google.com");
     urlencoded.append("success_url", "https://gfa2-dev-ed.lightning.force.com/lightning/page/home");
     urlencoded.append("customer", customerID);
     urlencoded.append("customer_update[address]", "auto");
     urlencoded.append("customer_update[name]", "auto");
     urlencoded.append("line_items[0][price_data][currency]", this.currency);
     urlencoded.append("line_items[0][price_data][product_data][name]", "Sales Force Example");
     urlencoded.append("line_items[0][price_data][product_data][description]", "Sales Force Example");
     urlencoded.append("line_items[0][price_data][unit_amount_decimal]", this.amount);
     urlencoded.append("line_items[0][quantity]", "1");
     urlencoded.append("mode", "payment");
     urlencoded.append("payment_method_types[0]", this.paymentMethodOne);
     urlencoded.append("payment_method_types[1]", this.paymentMethodTwo);
     var method = 'POST';
     var url = 'https://api.stripe.com/v1/checkout/sessions'
     let pcheckout = await makeGetCallout({urlencoded:urlencoded.toString(),url:url, method:method});
     var checkout = JSON.parse(pcheckout);
     window.open(checkout.url);
     //STRIPE FINISH
        this.confirmForm = !this.confirmForm;
        this.added = [];
        this.countProducts = 0;
        this.comingPrice = 0;
        this.price = 0;
        const evt = new ShowToastEvent({
            title: 'Success Payment',
            message:'Your orders has been shipped.',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }else {
        console.log('olmadi kanka')
        const evt = new ShowToastEvent({
            title: 'Error',
            message:'Fill the required fields.',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
    this.formName = '';
    this.formLastName = '';
    this.formCard = '';
    this.formCVV = '';
    this.formDate = '';
    this.formPhone = '';
   
}


}