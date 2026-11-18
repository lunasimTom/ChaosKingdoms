package android.webkit; import android.content.Context; import android.os.Bundle; public class WebView extends android.view.ViewGroup { public WebView(Context c){}
 public WebSettings getSettings(){return null;} public void setWebViewClient(WebViewClient c){} public void addJavascriptInterface(Object o, String n){} public void loadUrl(String u){}
 public WebBackForwardList restoreState(Bundle b){return null;} public WebBackForwardList saveState(Bundle b){return null;} public void evaluateJavascript(String s, ValueCallback<String> cb){}
 public void onPause(){} public void onResume(){} public void destroy(){} }
