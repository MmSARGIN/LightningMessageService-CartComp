import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import ADD_TO_CART from '@salesforce/messageChannel/Add_Cart__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addNewOrder from "@salesforce/apex/AddOrder.addNewOrder";

export default class AddedCart extends LightningElement {
    
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
handleConfirm(){
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