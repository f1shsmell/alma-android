package local.almaandroid.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.BridgeActivity;
import java.util.Collections;
import java.util.Locale;

/**
 * Alma Android 壳。
 * <p>
 * 原生侧职责（等价官方 iOS 壳）：
 * <ul>
 *   <li>WebView 权限：配对扫码用 getUserMedia 拿摄像头。Capacitor 的
 *       WebChromeClient 在 App 已持有运行时权限时会放行 WebView 的
 *       PermissionRequest —— 所以这里在启动时主动申请 CAMERA。</li>
 *   <li>首帧背景色与页面一致，减少启动白闪（暗色 = #282c34，随系统/应用主题）。</li>
 *   <li>edge-to-edge（Android 15 强制 / 部分 ROM 自行全屏）：系统栏图标
 *       深浅随主题，键盘 insets 由父容器补齐。</li>
 *   <li>注入系统 locale（renderer 语言检测用；WebView 的 navigator.language
 *       不随系统语言，需要原生权威值）。</li>
 * </ul>
 */
public class MainActivity extends BridgeActivity {

    /** 与 renderer 主题底色一致（shim 的 FOUC 打底同色）。 */
    private static final int BG_DARK = 0xFF282C34;
    private static final int BG_LIGHT = Color.WHITE;

    private WebView webView;

    private final androidx.activity.result.ActivityResultLauncher<String> cameraPermission =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            // 用户授予或拒绝都无需额外处理：授予后 WebView 的下一次
            // PermissionRequest 会被 Capacitor 放行；拒绝则扫码功能不可用（可再申请）。
        });

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            applyWebViewBackground(isNightMode());
            applySystemBars(isNightMode());
            attachImeInsetsListener();
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            cameraPermission.launch(Manifest.permission.CAMERA);
        }

        // 系统语言：Android WebView 的 navigator.language 不随系统语言（Capacitor
        // 长期已知问题，常返 en-US），renderer 的语言检测因此误判。原生侧提供权威
        // locale：documentStart 脚本（API 33+）在任何页面 JS 之前注入主帧与 iframe；
        // 旧设备回退 JavascriptInterface，由 shim 同步读取。二者皆无时 shim 退回
        // navigator.language。
        String langScript = "window.__almaAndroidLang__=\"" + Locale.getDefault().toLanguageTag() + "\";";
        try {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                java.util.Set<String> origins = new java.util.HashSet<>(java.util.Arrays.asList(
                        "https://localhost", "http://localhost"));
                WebViewCompat.addDocumentStartJavaScript(webView, langScript, origins);
            }
        } catch (Throwable t) {
            // 不支持则静默降级到 JavascriptInterface
        }
        try {
            webView.addJavascriptInterface(new LocaleBridge(), "__almaAndroidLocale");
            webView.addJavascriptInterface(new UiBridge(), "__almaAndroidUi");
        } catch (Throwable t) {
            // 同上
        }
    }

    // ── 主题底色 / 系统栏外观 ────────────────────────────────────────────

    private boolean isNightMode() {
        int ui = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return ui == Configuration.UI_MODE_NIGHT_YES;
    }

    /** WebView 底色：页面尚未绘制/重载时的兜底，必须与主题一致，否则暗色用户看到白闪。 */
    private void applyWebViewBackground(boolean dark) {
        if (webView != null) webView.setBackgroundColor(dark ? BG_DARK : BG_LIGHT);
    }

    /** 状态栏/导航栏图标深浅（dark=true 表示页面深色 → 图标用浅色）。 */
    private void applySystemBars(boolean dark) {
        try {
            WindowInsetsControllerCompat c = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            c.setAppearanceLightStatusBars(!dark);
            c.setAppearanceLightNavigationBars(!dark);
        } catch (Throwable t) {
            // 个别 ROM 上调整失败不影响功能
        }
    }

    /** 应用主题（"dark" | "light" | "system"）→ WebView 底色 + 系统栏图标。 */
    private void applyTheme(String mode) {
        boolean dark = "dark".equals(mode) || (!"light".equals(mode) && isNightMode());
        applyWebViewBackground(dark);
        applySystemBars(dark);
    }

    /**
     * 键盘 insets：edge-to-edge 下 Capacitor 只给 WebView 补 systemBars 边距并在
     * WebView 上 CONSUMED 全部 insets（含 ime）→ 键盘弹出会盖住输入框。在 WebView
     * 的父容器上按 ime 补底 padding（减去已由 WebView margin 处理的导航栏高度），
     * insets 继续透传给 WebView 供 Capacitor 使用。非 edge-to-edge 窗口 insets
     * 派发到这里已是 0，此监听为 no-op。
     */
    private void attachImeInsetsListener() {
        if (!(webView.getParent() instanceof View)) return;
        View parent = (View) webView.getParent();
        ViewCompat.setOnApplyWindowInsetsListener(parent, (v, insets) -> {
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(0, 0, 0, Math.max(0, ime.bottom - bars.bottom));
            return insets;
        });
    }

    /** uiMode 在 manifest 的 configChanges 里：系统深浅色切换不重建 Activity，手动同步。 */
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyWebViewBackground(isNightMode());
        applySystemBars(isNightMode());
    }

    /** 兜底 locale 通道：documentStart 不可用（<API 33）时由 shim 同步调用。 */
    public static class LocaleBridge {
        @JavascriptInterface
        public String getLanguageTag() {
            return Locale.getDefault().toLanguageTag();
        }
    }

    /**
     * 主题通道：shim 在启动时（appearance-cache）与每次主题切换时上报
     * "dark"/"light"/"system"，原生同步 WebView 底色与系统栏图标深浅 ——
     * 应用内主题（含"跟随系统"）与系统深浅色不一致时也能保持对比度。
     */
    public class UiBridge {
        @JavascriptInterface
        public void setTheme(final String mode) {
            runOnUiThread(() -> applyTheme(mode));
        }
    }

    /**
     * 返回键：设置层为同文档 iframe（shim 管理，无页面导航），
     * WebView 的历史栈不反映它的开合 —— 先问 JS 是否由设置层消化；
     * 否则按 Capacitor 默认（Web 历史可回退则回退，否则默认行为）。
     */
    @Override
    public void onBackPressed() {
        WebView wv = webView != null ? webView
                : (getBridge() != null ? getBridge().getWebView() : null);
        if (wv != null && !wv.canGoBack()) {
            // evaluateJavascript 的回调在 UI 线程执行；JS 未消化则走默认返回行为
            wv.evaluateJavascript(
                "(window.__almaAndroidBack ? window.__almaAndroidBack() : false)",
                new android.webkit.ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        if (!"true".equals(value)) {
                            MainActivity.super.onBackPressed();
                        }
                    }
                });
            return;
        }
        super.onBackPressed();
    }
}
