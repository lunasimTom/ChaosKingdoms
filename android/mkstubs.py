import os,sys
os.chdir(sys.argv[1])
S={
'android/content/Context.java':'package android.content; public abstract class Context { public static final String VIBRATOR_SERVICE="vibrator"; public Object getSystemService(String n){return null;} public ContentResolver getContentResolver(){return null;} }',
'android/content/ContentValues.java':'package android.content; public final class ContentValues { public void put(String k, String v){} }',
'android/content/ContentResolver.java':'package android.content; public abstract class ContentResolver { public final android.net.Uri insert(android.net.Uri u, ContentValues v){return null;} public final java.io.OutputStream openOutputStream(android.net.Uri u) throws java.io.FileNotFoundException {return null;} }',
'android/util/Base64.java':'package android.util; public class Base64 { public static final int DEFAULT=0; public static byte[] decode(String s, int f){return null;} }',
'android/os/Vibrator.java':'package android.os; public abstract class Vibrator { public boolean hasVibrator(){return false;} public void vibrate(long ms){} }',
'android/app/Activity.java':'''package android.app; import android.content.*; import android.os.Bundle; import android.view.*;
public class Activity extends Context { protected void onCreate(Bundle b){} public Window getWindow(){return null;} public void setContentView(View v){}
 public void onWindowFocusChanged(boolean f){} protected void onSaveInstanceState(Bundle b){} protected void onPause(){} protected void onResume(){} protected void onDestroy(){}
 public void onBackPressed(){} public boolean moveTaskToBack(boolean b){return false;} public final void runOnUiThread(Runnable r){} public void setRequestedOrientation(int o){} public void finish(){} public void startActivity(Intent i){} }''',
'android/content/Intent.java':'package android.content; public class Intent { public static final String ACTION_VIEW="android.intent.action.VIEW"; public Intent(String a, android.net.Uri u){} }',
'android/content/pm/ActivityInfo.java':'package android.content.pm; public class ActivityInfo { public static final int SCREEN_ORIENTATION_FULL_USER=13, SCREEN_ORIENTATION_SENSOR_PORTRAIT=7, SCREEN_ORIENTATION_SENSOR_LANDSCAPE=6; }',
'android/graphics/Color.java':'package android.graphics; public class Color { public static final int BLACK=0xFF000000; public static int rgb(int r,int g,int b){return 0;} }',
'android/net/Uri.java':'package android.net; public abstract class Uri { public static Uri parse(String s){return null;} }',
'android/os/Build.java':'package android.os; public class Build { public static class VERSION { public static final int SDK_INT = get(); private static int get(){return 0;} } }',
'android/os/Bundle.java':'package android.os; public final class Bundle {}',
'android/view/View.java':'''package android.view; public class View { public static final int SYSTEM_UI_FLAG_LAYOUT_STABLE=0x100, SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION=0x200, SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN=0x400, SYSTEM_UI_FLAG_HIDE_NAVIGATION=0x2, SYSTEM_UI_FLAG_FULLSCREEN=0x4, SYSTEM_UI_FLAG_IMMERSIVE_STICKY=0x1000, OVER_SCROLL_NEVER=2;
 public void setSystemUiVisibility(int v){} public void setOverScrollMode(int m){} public void setVerticalScrollBarEnabled(boolean b){} public void setHorizontalScrollBarEnabled(boolean b){} public void setBackgroundColor(int c){} }''',
'android/view/ViewGroup.java':'package android.view; public abstract class ViewGroup extends View { public static class LayoutParams {} }',
'android/view/Window.java':'package android.view; public abstract class Window { public void addFlags(int f){} public final WindowManager.LayoutParams getAttributes(){return null;} public void setAttributes(WindowManager.LayoutParams a){} public abstract void setStatusBarColor(int c); public abstract void setNavigationBarColor(int c); public abstract View getDecorView(); }',
'android/view/WindowManager.java':'package android.view; public interface WindowManager { public static class LayoutParams extends ViewGroup.LayoutParams { public static final int FLAG_KEEP_SCREEN_ON=0x80, FLAG_FULLSCREEN=0x400; public int layoutInDisplayCutoutMode; } }',
'android/webkit/JavascriptInterface.java':'package android.webkit; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target({ElementType.METHOD}) public @interface JavascriptInterface {}',
'android/webkit/ValueCallback.java':'package android.webkit; public interface ValueCallback<T> { void onReceiveValue(T value); }',
'android/webkit/WebBackForwardList.java':'package android.webkit; public abstract class WebBackForwardList {}',
'android/webkit/WebSettings.java':'''package android.webkit; public abstract class WebSettings { public abstract void setJavaScriptEnabled(boolean b); public abstract void setDomStorageEnabled(boolean b); public abstract void setDatabaseEnabled(boolean b);
 public abstract void setAllowFileAccess(boolean b); public abstract void setAllowFileAccessFromFileURLs(boolean b); public abstract void setMediaPlaybackRequiresUserGesture(boolean b); public abstract void setSupportZoom(boolean b);
 public abstract void setBuiltInZoomControls(boolean b); public abstract void setDisplayZoomControls(boolean b); public abstract void setUseWideViewPort(boolean b); public abstract void setLoadWithOverviewMode(boolean b); public abstract void setTextZoom(int z); }''',
'android/webkit/WebViewClient.java':'package android.webkit; public class WebViewClient { public boolean shouldOverrideUrlLoading(WebView v, String url){return false;} }',
'android/webkit/WebView.java':'''package android.webkit; import android.content.Context; import android.os.Bundle; public class WebView extends android.view.ViewGroup { public WebView(Context c){}
 public WebSettings getSettings(){return null;} public void setWebViewClient(WebViewClient c){} public void addJavascriptInterface(Object o, String n){} public void loadUrl(String u){}
 public WebBackForwardList restoreState(Bundle b){return null;} public WebBackForwardList saveState(Bundle b){return null;} public void evaluateJavascript(String s, ValueCallback<String> cb){}
 public void onPause(){} public void onResume(){} public void destroy(){} }''',
}
for p,c in S.items():
  os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w').write(c+'\n')
print(len(S))
