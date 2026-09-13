package com.sousa.appagendateste

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.content.Intent
import android.widget.Button

class ListaTarefasActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        setContentView(R.layout.lista_tarefas)

        findViewById<Button>(R.id.btnProximo).setOnClickListener {
            startActivity(Intent(this, DetalhesTarefaActivity::class.java))
        }

    }

}