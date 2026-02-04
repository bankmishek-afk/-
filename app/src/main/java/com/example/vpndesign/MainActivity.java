package com.example.vpndesign;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private boolean isConnected = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button connectButton = findViewById(R.id.connectButton);
        TextView statusTextView = findViewById(R.id.statusTextView);

        connectButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                isConnected = !isConnected;
                if (isConnected) {
                    statusTextView.setText(R.string.status_connected);
                    connectButton.setText(R.string.disconnect);
                    connectButton.setBackgroundResource(R.drawable.round_button_connected);
                } else {
                    statusTextView.setText(R.string.status_disconnected);
                    connectButton.setText(R.string.connect);
                    connectButton.setBackgroundResource(R.drawable.round_button);
                }
            }
        });
    }
}
