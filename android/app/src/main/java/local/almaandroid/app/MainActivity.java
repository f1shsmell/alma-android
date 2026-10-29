package local.almaandroid.app;

import android.Manifest;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.BridgeActivity;
import java.io.File;
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

    /** 自更新：进行中的 DownloadManager 任务 id（-1 = 无）。 */
    private long updateDownloadId = -1;
    /** 主下载地址失败后的镜像重试地址（JS 传入，一次性）。 */
    private String updateFallbackUrl;

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
            webView.addJavascriptInterface(new UpdateBridge(), "__almaAndroidUpdate");
        } catch (Throwable t) {
            // 同上
        }

        // 应用内自更新：DownloadManager 完成广播 → 拉起系统安装器
        IntentFilter doneFilter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(updateReceiver, doneFilter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(updateReceiver, doneFilter);
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

    // ── 应用内自更新 ────────────────────────────────────────────────────

    /**
     * 更新下载完成广播：成功 → 通过 FileProvider 拉起系统安装器；失败 →
     * 用镜像地址重试一次（GitHub 直连在国内常超时）。终态经
     * window.__almaUpdateState 回调给 shim（设置页"检查更新"行状态机）。
     */
    private final BroadcastReceiver updateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
            if (id == -1 || id != updateDownloadId) return;
            updateDownloadId = -1;
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            Cursor c = null;
            try {
                c = dm.query(new DownloadManager.Query().setFilterById(id));
                if (c == null || !c.moveToFirst()) return;
                int col = c.getColumnIndex(DownloadManager.COLUMN_STATUS);
                int status = col >= 0 ? c.getInt(col) : DownloadManager.STATUS_FAILED;
                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                    installUpdate(); // 内部回调 downloaded / permission / error
                } else if (updateFallbackUrl != null) {
                    String fb = updateFallbackUrl;
                    updateFallbackUrl = null;
                    startUpdateDownload(fb);
                } else {
                    notifyUpdateState("error");
                }
            } finally {
                if (c != null) c.close();
            }
        }
    };

    /** 通知栏可见的 APK 下载（DownloadManager，断点续传由系统管理）。 */
    private void startUpdateDownload(String url) {
        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
        DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
        req.setTitle(getString(R.string.title_activity_main));
        req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        // 与 file_paths.xml 的 external-files-path "updates" 对应
        req.setDestinationInExternalFilesDir(this, "updates", "alma-update.apk");
        updateDownloadId = dm.enqueue(req);
    }

    /**
     * 拉起系统安装器安装已下载的 APK。Android 8+ 需用户先授予本应用
     * "安装未知应用"：未授予时直接引导到对应设置页（比依赖各 ROM 行为
     * 不一的 ActivityNotFoundException 兜底更可控），授权后回设置页
     * 再点一次"安装"即可。
     */
    private void installUpdate() {
        File dir = getExternalFilesDir("updates");
        File apk = dir == null ? null : new File(dir, "alma-update.apk");
        if (apk == null || !apk.exists()) {
            notifyUpdateState("error");
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= 26
                    && !getPackageManager().canRequestPackageInstalls()) {
                Intent s = new Intent(
                        android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getPackageName()));
                startActivity(s);
                notifyUpdateState("permission");
                return;
            }
            Uri content = FileProvider.getUriForFile(this,
                    getPackageName() + ".fileprovider", apk);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(content, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(i);
            notifyUpdateState("downloaded");
        } catch (Throwable t) {
            notifyUpdateState("error");
        }
    }

    /** 下载终态同步给 shim；无监听（页面已翻页/重载）时静默。 */
    private void notifyUpdateState(String state) {
        if (webView == null) return;
        try {
            webView.evaluateJavascript(
                "(window.__almaUpdateState?window.__almaUpdateState(\""
                    + state.replace("\\", "\\\\").replace("\"", "\\\"")
                    + "\"):0)", null);
        } catch (Throwable t) {
            // WebView 已销毁等
        }
    }

    /**
     * 自更新通道：window.almaUpdate 读壳版本（versionName 以 PackageManager
     * 为权威 —— BuildConfig 在 AGP 8 默认不生成）、发起下载。调用来自
     * WebView 的 JS 线程；DownloadManager 入队线程安全，安装动作在完成
     * 广播（主线程）里做。
     */
    public class UpdateBridge {
        @JavascriptInterface
        public String getVersionName() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Throwable t) {
                return "";
            }
        }

        /** @return "ok" 或错误码（shim 展示）；真正结果经 __almaUpdateState 回调。 */
        @JavascriptInterface
        public String downloadAndInstall(String url, String fallback) {
            try {
                String u = url == null ? "" : url.trim();
                if (!u.startsWith("http")) return "bad-url";
                updateFallbackUrl = (fallback != null && fallback.trim().startsWith("http"))
                        ? fallback.trim() : null;
                startUpdateDownload(u);
                return "ok";
            } catch (Throwable t) {
                return "error";
            }
        }

        /**
         * 下载进度（shim 轮询渲染进度条）。STATUS_PAUSED（断网/等待网络）也
         * 报 "downloading"——对用户而言任务仍在进行，避免进度条闪烁。
         */
        @JavascriptInterface
        public String downloadProgress() {
            try {
                if (updateDownloadId == -1) return "{\"status\":\"none\"}";
                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                Cursor c = dm.query(new DownloadManager.Query().setFilterById(updateDownloadId));
                try {
                    if (c == null || !c.moveToFirst()) return "{\"status\":\"none\"}";
                    int sCol = c.getColumnIndex(DownloadManager.COLUMN_STATUS);
                    int dCol = c.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
                    int tCol = c.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);
                    int st = sCol >= 0 ? c.getInt(sCol) : -1;
                    long done = dCol >= 0 ? c.getLong(dCol) : 0;
                    long total = tCol >= 0 ? c.getLong(tCol) : -1;
                    String name = st == DownloadManager.STATUS_RUNNING
                            || st == DownloadManager.STATUS_PAUSED ? "downloading"
                            : st == DownloadManager.STATUS_SUCCESSFUL ? "successful" : "failed";
                    return "{\"status\":\"" + name + "\",\"transferred\":" + done
                            + ",\"total\":" + total + "}";
                } finally {
                    if (c != null) c.close();
                }
            } catch (Throwable t) {
                return "{\"status\":\"none\"}";
            }
        }

        /** "update-downloaded" 后 UI 的"重启安装"键：重新拉起安装器（首次弹窗可能被取消）。 */
        @JavascriptInterface
        public void launchInstaller() {
            runOnUiThread(() -> installUpdate());
        }
    }

    @Override
    public void onDestroy() {
        try {
            unregisterReceiver(updateReceiver);
        } catch (Throwable t) {
            // 未注册时忽略
        }
        super.onDestroy();
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
