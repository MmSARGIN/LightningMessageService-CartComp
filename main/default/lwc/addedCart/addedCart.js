import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import ADD_TO_CART from '@salesforce/messageChannel/Add_Cart__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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
            this.comingPrice = this.price.toFixed(2);
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
                        this.comingPrice = this.price.toFixed(2);
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
}