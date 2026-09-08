package br.com.contacerta.independente;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_REQUEST = 7001;
    private WebView printWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);

        webView.addJavascriptInterface(new AndroidBridge(), "Android");

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/json");
                startActivityForResult(i, FILE_CHOOSER_REQUEST);
                return true;
            }
        });

        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html");
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("(function(){var n=document.querySelector('nav'); if(n&&n.classList.contains('open')){n.classList.remove('open');return 'closed'} return 'no';})()", value -> {
            if ("\"closed\"".equals(value)) return;
            if (webView.canGoBack()) webView.goBack(); else MainActivity.super.onBackPressed();
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[]{data.getData()};
            if (filePathCallback != null) filePathCallback.onReceiveValue(result);
            filePathCallback = null;
        }
    }

    private void printCurrentPage(String title) {
        PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(title);
        pm.print(title, adapter, new PrintAttributes.Builder().build());
    }

    private void printHtmlDocument(String html, String title) {
        printWebView = new WebView(this);
        printWebView.getSettings().setJavaScriptEnabled(true);
        printWebView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(title);
                pm.print(title, adapter, new PrintAttributes.Builder().build());
            }
        });
        printWebView.loadDataWithBaseURL("https://appassets.androidplatform.net/", html, "text/html", "UTF-8", null);
    }

    class AndroidBridge {
        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> printCurrentPage("Conta Certa"));
        }

        @JavascriptInterface
        public void printHtml(String html, String title) {
            runOnUiThread(() -> printHtmlDocument(html, title == null ? "Conta Certa" : title));
        }

        @JavascriptInterface
        public void saveBackup(String json, String filename) {
            runOnUiThread(() -> {
                try {
                    String safe = (filename == null || filename.trim().isEmpty()) ? "backup_conta_certa.json" : filename.replaceAll("[^a-zA-Z0-9._-]", "_");
                    OutputStream os;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                        values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ContaCerta");
                        Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                        if (uri == null) throw new Exception("Não foi possível criar o arquivo");
                        os = getContentResolver().openOutputStream(uri);
                    } else {
                        File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "ContaCerta");
                        if (!dir.exists()) dir.mkdirs();
                        os = new FileOutputStream(new File(dir, safe));
                    }
                    if (os == null) throw new Exception("Saída indisponível");
                    os.write(json.getBytes(StandardCharsets.UTF_8));
                    os.close();
                    Toast.makeText(MainActivity.this, "Backup salvo em Downloads/ContaCerta", Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    new AlertDialog.Builder(MainActivity.this).setTitle("Conta Certa").setMessage("Erro ao salvar backup: " + e.getMessage()).setPositiveButton("OK", null).show();
                }
            });
        }
    }
}
