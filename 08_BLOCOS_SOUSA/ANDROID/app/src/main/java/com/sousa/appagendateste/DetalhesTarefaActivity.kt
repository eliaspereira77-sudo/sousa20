package com.sousa.appagendateste

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.content.Intent
import android.widget.Button

class DetalhesTarefaActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        setContentView(R.layout.detalhes_tarefa)

        findViewById<Button>(R.id.btnProximo).setOnClickListener {
            startActivity(Intent(this, InicioActivity::class.java))
        }

    }

}