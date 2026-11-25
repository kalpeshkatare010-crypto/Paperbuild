package com.paperbuild.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/** Paper Build: the web app bundled in assets/www, shown full screen in a WebView. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/www/app.html";
    private static final int PICK_IMAGE = 42;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        if (Build.VERSION.SDK_INT >= 23) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
        web = new WebView(this);
        setContentView(web);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setTextZoom(100);
        s.setJavaScriptCanOpenWindowsAutomatically(true);

        web.addJavascriptInterface(new Bridge(), "PaperBuildAndroid");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                if (HOST.equals(uri.getHost())) return false;
                // Razorpay checkout pages must load inside the app.
                if (("https".equals(scheme) || "http".equals(scheme)) && uri.getHost() != null
                        && uri.getHost().endsWith("razorpay.com")) return false;
                try {
                    if ("intent".equals(scheme)) {
                        // UPI apps (GPay, PhonePe, Paytm) are opened with intent:// links.
                        Intent intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                        try {
                            startActivity(intent);
                        } catch (ActivityNotFoundException e) {
                            String fallback = intent.getStringExtra("browser_fallback_url");
                            if (fallback != null) view.loadUrl(fallback);
                        }
                    } else {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    }
                } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("image/*");
                try {
                    startActivityForResult(Intent.createChooser(pick, "Choose an image"), PICK_IMAGE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (!openAuthReturn(getIntent())) {
            if (state != null) web.restoreState(state);
            else web.loadUrl(START);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        openAuthReturn(intent);
    }

    /** Handles paperbuild://auth?code=... after Google sign-in in the browser. */
    private boolean openAuthReturn(Intent intent) {
        Uri data = intent == null ? null : intent.getData();
        if (data == null || !"paperbuild".equals(data.getScheme())) return false;
        String query = data.getEncodedQuery();
        web.loadUrl(START + (query != null ? "?" + query : ""));
        return true;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    private void openPdf(final Uri uri) {
        runOnUiThread(() -> {
            Intent view = new Intent(Intent.ACTION_VIEW);
            view.setDataAndType(uri, "application/pdf");
            view.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                startActivity(view);
            } catch (ActivityNotFoundException e) {
                Toast.makeText(MainActivity.this, "Saved. Install a PDF viewer to open it.", Toast.LENGTH_LONG).show();
            }
        });
    }

    /** Called from app.html to save the generated PDF. Returns where it was saved, or "" on failure. */
    private class Bridge {
        @JavascriptInterface
        public void openExternal(String url) {
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, "No browser found to open the sign-in page.", Toast.LENGTH_LONG).show();
                }
            });
        }

        @JavascriptInterface
        public String savePdf(String name, String base64) {
            try {
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
                if (!safe.toLowerCase().endsWith(".pdf")) safe += ".pdf";
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/PaperBuild");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) return "";
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                        if (os == null) return "";
                        os.write(bytes);
                    }
                    openPdf(uri);
                    return "Downloads/PaperBuild";
                } else {
                    File dir = new File(getExternalFilesDir(null), "PDFs");
                    if (!dir.exists() && !dir.mkdirs()) return "";
                    File file = new File(dir, safe);
                    try (FileOutputStream os = new FileOutputStream(file)) {
                        os.write(bytes);
                    }
                    Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".files", file);
                    openPdf(uri);
                    return "the app's PDFs folder";
                }
            } catch (Exception e) {
                return "";
            }
        }
    }
}
