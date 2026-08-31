/**
 * SOUSA_USB_CATALOG.js
 * Catálogo oficial USB Modular
 * v1.0.0
 */


const SOUSA_USB_CATALOG = {


 componentes:[],


 adicionar:function(componente){


   this.componentes.push(componente);


   return {


     sucesso:true,


     mensagem:
     "Componente adicionado ao catálogo",


     componente:
     componente


   };


 },


 listar:function(){


   return {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     total:
     this.componentes.length,


     componentes:
     this.componentes


   };


 },


 buscar:function(id){


   return this.componentes.find(

     item => item.id === id

   ) || null;


 }


};