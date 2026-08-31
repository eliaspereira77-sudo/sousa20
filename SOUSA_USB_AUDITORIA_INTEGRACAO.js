/**
 * SOUSA_USB_AUDITORIA_INTEGRACAO.js
 * Integra USB + Auditoria
 * v1.0.0
 */


const SOUSA_USB_AUDITORIA_INTEGRACAO = {


 cadastro:function(mecanismo){


   return SOUSA_AUDITORIA_USB.registrar({

     tipo:"CADASTRO_MECANISMO",

     origem:"USB_MODULAR",

     detalhes:mecanismo

   });


 },


 validacao:function(mecanismo){


   return SOUSA_AUDITORIA_USB.registrar({

     tipo:"VALIDACAO_MECANISMO",

     origem:"VALIDATOR",

     detalhes:mecanismo

   });


 },


 ativacao:function(mecanismo){


   return SOUSA_AUDITORIA_USB.registrar({

     tipo:"ATIVACAO_MECANISMO",

     origem:"PLUG_AND_PLAY",

     detalhes:mecanismo

   });


 }


};