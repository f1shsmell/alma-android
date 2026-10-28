package local.almaandroid.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

/**
 * Alma Android 壳。
 * <p>
 * 原生侧职责（等价官方 iOS 壳）：
 * <ul>
 *   <li>WebView 权限：配对扫码用 getUserMedia 拿摄像头。Capacitor 的
 *       WebChromeClient 在 App 已持有运行时权限时会放行 WebView 的
 *       PermissionRequest —— 所以这里在启动时主动申请 CAMERA。</li>
 *   <li>首帧背景色与页面一致，减少启动白闪。</li>
 * </ul>
 */
public class MainActivity extends BridgeActivity {

    private final androidx.activity.result.ActivityResultLauncher<String> cameraPermission =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            // 用户授予或拒绝都无需额外处理：授予后 WebView 的下一次
            // PermissionRequest 会被 Capacitor 放行；拒绝则扫码功能不可用（可再申请）。
        });

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            // 与 renderer 主题底色一致，避免加载期白块/闪动
            webView.setBackgroundColor(Color.WHITE);
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            cameraPermission.launch(Manifest.permission.CAMERA);
        }
    }

    /**
     * 返回键：设置层为同文档 iframe（shim 管理，无页面导航），
     * WebView 的历史栈不反映它的开合 —— 先问 JS 是否由设置层消化；
     * 否则按 Capacitor 默认（Web 历史可回退则回退，否则默认行为）。
     */
    @Override
    public void onBackPressed() {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null && !webView.canGoBack()) {
            // evaluateJavascript 的回调在 UI 线程执行；JS 未消化则走默认返回行为
            webView.evaluateJavascript(
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
