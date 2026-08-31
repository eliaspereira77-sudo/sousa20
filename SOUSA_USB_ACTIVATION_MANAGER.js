/**
 * SOUSA_USB_ACTIVATION_MANAGER.js
 * Gerenciador de ativação USB Modular
 * v1.0.0
 */


const SOUSA_USB_ACTIVATION_MANAGER = {


 ativar:function(componente){


   if(componente.status !== "VALIDADO"){


     return {


       sucesso:false,


       status:
       "BLOQUEADO",


       motivo:
       "Componente precisa estar VALIDADO"


     };


   }


   const ativacao = {


     id:
     componente.id,


     nome:
     componente.nome,


     status:
     "ATIVO",


     dataAtivacao:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(ativacao)
   );


   return {


     sucesso:true,


     mensagem:
     "Componente ativado",


     componente:
     ativacao


   };


 }


};