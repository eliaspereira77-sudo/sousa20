package com.sousa.appagendateste

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

// Banco de dados local (SQLite nativo do Android — gratuito, sem dependência externa)
// Template gerado para a categoria: agenda
// Estrutura genérica de "itens" — ajuste os campos conforme a necessidade real do app.
class BancoDadosHelper(context: Context) :
    SQLiteOpenHelper(context, "sousa_agenda.db", null, 1) {

    companion object {
        const val TABELA_ITENS = "itens"
        const val COL_ID = "id"
        const val COL_TITULO = "titulo"
        const val COL_DESCRICAO = "descricao"
        const val COL_DATA_CRIACAO = "data_criacao"
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE ${TABELA_ITENS} (
                ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
                ${COL_TITULO} TEXT NOT NULL,
                ${COL_DESCRICAO} TEXT,
                ${COL_DATA_CRIACAO} TEXT NOT NULL
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS ${TABELA_ITENS}")
        onCreate(db)
    }

}