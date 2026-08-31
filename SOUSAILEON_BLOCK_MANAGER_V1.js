/*
====================================================
🦾 SOUSAILEON BLOCK MANAGER V1
Gerenciador de Blocos de Código
SOUSA 2.0
====================================================
*/

const fs = require("fs");
const path = require("path");

console.log("🦾 SOUSAILEON BLOCK MANAGER V1");
console.log("==============================");

const catalogo = path.join(
    "08_BLOCOS_SOUSA",
    "BIBLIOTECA",
    "CATALOGO_BLOCOS.json"
);


if (!fs.existsSync(catalogo)) {

    console.log("⚠️ Catálogo não encontrado.");
    process.exit();

}


const dados = JSON.parse(
    fs.readFileSync(catalogo, "utf8")
);


console.log("Sistema:", dados.sistema);
console.log("Módulo:", dados.modulo);
console.log("");

console.log("🧩 Blocos disponíveis:");

dados.blocos.forEach((bloco, indice)=>{

    console.log(
        `${indice + 1}. ${bloco.nome} | ${bloco.status}`
    );

});


console.log("");
console.log("🦾 Leitura de blocos concluída.");