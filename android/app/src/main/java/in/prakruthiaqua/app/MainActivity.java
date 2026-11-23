package in.prakruthiaqua.app;

import android.graphics.Color;
import android.net.Uri;
import android.view.View;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    @Override
    protected void load() {
        // Configure playback before Capacitor starts loading the hosted store.
        WebView initialView = findViewById(com.getcapacitor.android.R.id.webview);
        if (initialView != null) initialView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        super.load();
        WebView webView = bridge.getWebView();
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
                prepareVideos(view, url);
            }
        });
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
