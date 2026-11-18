package android.app; import android.content.*; import android.os.Bundle; import android.view.*;
public class Activity extends Context { protected void onCreate(Bundle b){} public Window getWindow(){return null;} public void setContentView(View v){}
 public void onWindowFocusChanged(boolean f){} protected void onSaveInstanceState(Bundle b){} protected void onPause(){} protected void onResume(){} protected void onDestroy(){}
 public void onBackPressed(){} public boolean moveTaskToBack(boolean b){return false;} public final void runOnUiThread(Runnable r){} public void setRequestedOrientation(int o){} public void finish(){} public void startActivity(Intent i){} }
