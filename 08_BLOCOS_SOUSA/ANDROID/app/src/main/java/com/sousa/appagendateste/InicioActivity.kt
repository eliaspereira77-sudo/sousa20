package com.sousa.appagendateste

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.content.Intent
import android.widget.Button

class InicioActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        setContentView(R.layout.inicio)

        findViewById<Button>(R.id.btnProximo).setOnClickListener {
            startActivity(Intent(this, NovaTarefaActivity::class.java))
        }

    }

}