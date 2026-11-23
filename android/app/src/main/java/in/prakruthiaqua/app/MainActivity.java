package in.prakruthiaqua.app;

import android.graphics.Color;
import android.graphics.Bitmap;
import android.net.Uri;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebBackForwardList;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.BridgeWebViewClient;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    private boolean resetHistoryAtHome = false;
    @Override
    protected void load() {
        // Configure playback before Capacitor starts loading the hosted store.
        WebView initialView = findViewById(com.getcapacitor.android.R.id.webview);
        if (initialView != null) initialView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        super.load();
        WebView webView = bridge.getWebView();
        // Android's default video poster contains a giant play icon; background
        // videos must remain transparent until their first decoded frame.
        webView.setWebChromeClient(new BridgeWebChromeClient(bridge) {
            @Override public Bitmap getDefaultVideoPoster() {
                return Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888);
            }
        });
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.rgb(38, 63, 4));
        getWindow().setNavigationBarColor(Color.rgb(38, 63, 4));
        WindowCompat.getInsetsController(getWindow(), webView).setAppearanceLightStatusBars(false);
        WindowCompat.getInsetsController(getWindow(), webView).setAppearanceLightNavigationBars(false);
        View container = (View) webView.getParent();
        container.setBackgroundColor(Color.rgb(38, 63, 4));
        ViewCompat.setOnApplyWindowInsetsListener(container, (view, windowInsets) -> {
            Insets bars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets keyboard = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, keyboard.bottom));
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(container);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                WebBackForwardList history = webView.copyBackForwardList();
                int previous = history.getCurrentIndex() - 1;
                // Skip the WebView's initial blank/local page; only navigate store history.
                if (previous >= 0 && isStoreUrl(history.getItemAtIndex(previous).getUrl())) {
                    webView.goBack();
                    return;
                }
                Uri current = Uri.parse(webView.getUrl() == null ? "" : webView.getUrl());
                String path = current.getPath();
                boolean home = isStoreUrl(current.toString()) && (path == null || path.isEmpty() || "/".equals(path))
                    && current.getQuery() == null && current.getFragment() == null;
                if (!home) {
                    resetHistoryAtHome = true;
                    webView.loadUrl("https://prakruthiaqua.in/");
                    return;
                }
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Exit Prakruthi Aqua?")
                    .setMessage("Would you like to close the app?")
                    .setNegativeButton("Stay", (dialog, which) -> dialog.dismiss())
                    .setPositiveButton("Exit", (dialog, which) -> finish())
                    .show();
            }
        });

        final String videoScript = readVideoScript();
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            private void prepareVideos(WebView view, String url) {
                Uri uri = Uri.parse(url);
                String host = uri.getHost();
                if ("https".equals(uri.getScheme()) && ("prakruthiaqua.in".equals(host) || "www.prakruthiaqua.in".equals(host))) {
                    view.evaluateJavascript(videoScript, null);
                }
            }
            @Override public void onPageCommitVisible(WebView view, String url) {
                super.onPageCommitVisible(view, url);
                prepareVideos(view, url);
            }
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (resetHistoryAtHome && isStoreUrl(url) && "/".equals(Uri.parse(url).getPath())) {
                    view.clearHistory();
                    resetHistoryAtHome = false;
                }
                prepareVideos(view, url);
            }
        });
    }

    private boolean isStoreUrl(String url) {
        if (url == null) return false;
        Uri uri = Uri.parse(url);
        return "https".equals(uri.getScheme()) && ("prakruthiaqua.in".equals(uri.getHost())
            || "www.prakruthiaqua.in".equals(uri.getHost()));
    }

    private String readVideoScript() {
        try (InputStream input = getAssets().open("app-video.js"); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            return new String(output.toByteArray(), StandardCharsets.UTF_8);
        } catch (java.io.IOException error) {
            return "void 0";
        }
    }
}
