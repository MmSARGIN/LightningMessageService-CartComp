import {
    LightningElement,
    track,
    wire
} from "lwc";
import {publish, MessageContext } from "lightning/messageService";
import ADD_TO_CART from '@salesforce/messageChannel/Add_Cart__c';


export default class ExploreFetchAPI extends LightningElement {
    @track repos;
   @track number = 0;
   @wire(MessageContext)
   messageContext;

    async connectedCallback(){
     let endPoint = "https://fakestoreapi.com/products";
        const response = await fetch(endPoint);
        const repos = await response.json();
        this.repos = repos;
        // console.log(repos);
        
        
    }
    
    
   
    

    handleIncrease(event){
        const payload = {
            operator : 'add',
            constant : 1,
            targetname : event.target.id,
            products: this.repos
        }
        publish(this.messageContext, ADD_TO_CART, payload)

    }
    handleDecrease(event){
        const payload = {
            operator : 'sub',
            constant : 1,
            targetname : event.target.id,
            products: this.repos
        }
        publish(this.messageContext, ADD_TO_CART, payload);
    }
}
