package us.hermeslogistics.aicontrol;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

/** Safe mobile entrypoint. The Paperclip app itself runs on a separate authenticated server. */
public final class MainActivity extends Activity {
    private static final String PREF_NAME = "hermes_ai_control_preview";
    private static final String PREF_URL = "approved_https_dashboard_url";
    private static final int INK = Color.rgb(25, 55, 43);
    private static final int SECONDARY = Color.rgb(77, 100, 89);
    private static final int GREEN = Color.rgb(35, 104, 73);
    private EditText urlInput;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(247, 250, 247));
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(247, 250, 247));

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(24), dp(52), dp(24), dp(40));
        scroll.addView(root, new ScrollView.LayoutParams(-1, -2));

        TextView caption = text("HERMES · AI OPERATIONS", 12, GREEN, Typeface.BOLD);
        caption.setLetterSpacing(0.1f);
        root.addView(caption);

        TextView heading = text("Hermes AI Control", 30, INK, Typeface.BOLD);
        LinearLayout.LayoutParams hp = new LinearLayout.LayoutParams(-1, -2);
        hp.topMargin = dp(24);
        root.addView(heading, hp);

        TextView intro = text("Управление AI-агентами с телефона", 18, SECONDARY, Typeface.NORMAL);
        LinearLayout.LayoutParams ip = new LinearLayout.LayoutParams(-1, -2);
        ip.topMargin = dp(12);
        root.addView(intro, ip);

        TextView status = text("Ожидается защищённый сервер Paperclip", 15, INK, Typeface.BOLD);
        status.setPadding(dp(18), dp(20), dp(18), dp(20));
        status.setBackground(rounded(Color.rgb(231, 241, 233), 14));
        LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(-1, -2);
        sp.topMargin = dp(28);
        root.addView(status, sp);

        TextView instruction = text(
            "Введите HTTPS-адрес вашей частной панели Paperclip. Не вводите пароль, токен или секрет в это поле. Авторизация произойдёт в браузере.",
            15, SECONDARY, Typeface.NORMAL);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
        p.topMargin = dp(28);
        root.addView(instruction, p);

        urlInput = new EditText(this);
        urlInput.setSingleLine(true);
        urlInput.setTextSize(15);
        urlInput.setTextColor(INK);
        urlInput.setHint("https://your-server.tailnet.ts.net");
        urlInput.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        urlInput.setBackground(rounded(Color.WHITE, 12));
        urlInput.setPadding(dp(16), dp(16), dp(16), dp(16));
        SharedPreferences settings = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        urlInput.setText(settings.getString(PREF_URL, ""));
        LinearLayout.LayoutParams u = new LinearLayout.LayoutParams(-1, dp(62));
        u.topMargin = dp(18);
        root.addView(urlInput, u);

        Button open = new Button(this);
        open.setText("ОТКРЫТЬ ПАНЕЛЬ");
        open.setTextColor(Color.WHITE);
        open.setAllCaps(false);
        open.setBackground(rounded(GREEN, 12));
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-1, dp(58));
        bp.topMargin = dp(18);
        root.addView(open, bp);
        open.setOnClickListener(v -> openExternalDashboard());

        TextView foot = text(
            "Версия 0.1 — тестовое приложение. Не запускает агентов само, не хранит пароли и не подключается к Hermes CRM. Для работы потребуется настроенный Paperclip с авторизацией и частным доступом.",
            13, SECONDARY, Typeface.NORMAL);
        LinearLayout.LayoutParams fp = new LinearLayout.LayoutParams(-1, -2);
        fp.topMargin = dp(30);
        root.addView(foot, fp);
        setContentView(scroll);
    }

    private void openExternalDashboard() {
        String supplied = urlInput.getText().toString().trim();
        String canonical = normalizeSafeHttpsUrl(supplied);
        if (canonical == null) {
            Toast.makeText(this, "Нужен HTTPS-адрес без логина, пароля, токена и параметров", Toast.LENGTH_LONG).show();
            return;
        }
        getSharedPreferences(PREF_NAME, MODE_PRIVATE).edit().putString(PREF_URL, canonical).apply();
        Intent view = new Intent(Intent.ACTION_VIEW, Uri.parse(canonical));
        view.addCategory(Intent.CATEGORY_BROWSABLE);
        try {
            startActivity(view);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Не найден браузер для HTTPS", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * URL-only configuration, never a password or token.
     * Real session and authentication stay entirely in the system browser.
     */
    private static String normalizeSafeHttpsUrl(String supplied) {
        if (supplied == null || supplied.isEmpty()) return null;
        try {
            URI parsed = new URI(supplied);
            String hostname = parsed.getHost();
            if (!"https".equalsIgnoreCase(parsed.getScheme()) || hostname == null) return null;
            String host = hostname.toLowerCase(Locale.ROOT);
            if (host.equals("localhost") || host.equals("127.0.0.1") || host.equals("0.0.0.0")) return null;
            if (parsed.getUserInfo() != null || parsed.getQuery() != null || parsed.getFragment() != null) return null;
            if (parsed.getPort() > 0 && parsed.getPort() != 443) return null;
            // Keep a canonical https origin: no injected pathname, parameters or secret-bearing query.
            return new URI("https", null, host, parsed.getPort() == 443 ? -1 : parsed.getPort(), "/", null, null).toString();
        } catch (URISyntaxException ex) {
            return null;
        }
    }

    private TextView text(String content, int size, int color, int style) {
        TextView view = new TextView(this);
        view.setText(content);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setTypeface(Typeface.DEFAULT, style);
        view.setGravity(Gravity.START);
        return view;
    }

    private GradientDrawable rounded(int color, int radiusDp) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(dp(radiusDp));
        return drawable;
    }

    private int dp(int px) {
        return Math.round(px * getResources().getDisplayMetrics().density);
    }
}
