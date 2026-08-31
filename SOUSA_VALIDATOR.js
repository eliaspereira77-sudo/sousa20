function validarComandoValidator(comando) {

    var resultado = {
        sistema: "SOUSA 2.0",
        autorizado: false,
        status: "",
        motivo: ""
    };

    if (!comando) {
        comando = {
            sistema: "SOUSA 2.0",
            autorizacao: "Fundador"
        };
    }

    if (comando.sistema !== "SOUSA 2.0") {
        resultado.status = "BLOQUEADO";
        resultado.motivo = "Sistema de destino nao identificado.";
    } else if (comando.autorizacao !== "Fundador") {
        resultado.status = "BLOQUEADO";
        resultado.motivo = "Autorizacao invalida.";
    } else {
        resultado.autorizado = true;
        resultado.status = "APROVADO";
        resultado.motivo = "Comando reconhecido pelo SOUSA 2.0.";
    }

    console.log(JSON.stringify(resultado, null, 2));
    return resultado;
}
