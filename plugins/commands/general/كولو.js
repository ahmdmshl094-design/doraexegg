import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DeveloperBadge
 * - يقرأ ملف الكونفج (افتراضي: config.main.json) لاستخراج NAME و DEVELOPER
 * - يعرض نافذة Swing أنيقة مع بطاقة تحتوي على اسم البوت واسم المطور 🇸🇩
 *
 * الطريقة: 
 *  javac DeveloperBadge.java
 *  java DeveloperBadge /path/to/config.main.json
 *
 * أو بدون وسيط لقراءة config.main.json من نفس المجلد.
 */
public class DeveloperBadge {

    public static void main(String[] args) {
        String configPath = args.length > 0 ? args[0] : "config.main.json";
        String botName = "dora bot"; // fallback
        String developer = "كولو سان 🇸🇩"; // fallback

        try {
            String content = readFile(configPath);
            String n = extractJsonString(content, "NAME");
            String d = extractJsonString(content, "DEVELOPER");
            if (n != null && !n.isEmpty()) botName = n;
            if (d != null && !d.isEmpty()) developer = d + " 🇸🇩";
        } catch (IOException e) {
            System.err.println("لم أتمكن من قراءة ملف الكونفج: " + configPath + " — سيتم استخدام القيم الافتراضية.");
        }

        final String finalBotName = botName;
        final String finalDeveloper = developer;

        SwingUtilities.invokeLater(() -> {
            try {
                // تفعيل مظهر نظام التشغيل (محسن)
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {}
            createAndShow(finalBotName, finalDeveloper);
        });
    }

    // قراءة ملف كامل كسلسلة UTF-8
    private static String readFile(String path) throws IOException {
        byte[] bytes = Files.readAllBytes(Paths.get(path));
        return new String(bytes, StandardCharsets.UTF_8);
    }

    // استخراج قيمة نصية من JSON بسيط (لا يحتاج مكتبات خارجية)
    // يبحث عن "key": "value" ويتجاهل المسافات والفواصل
    private static String extractJsonString(String json, String key) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    // واجهة المستخدم
    private static void createAndShow(String botName, String developer) {
        JFrame frame = new JFrame("Dora Bot - مطور");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(520, 320);
        frame.setLocationRelativeTo(null);
        frame.setLayout(new BorderLayout());

        // لوحة الخلفية بتدرّج
        GradientPanel bg = new GradientPanel();
        bg.setLayout(new GridBagLayout());
        bg.setBorder(new EmptyBorder(20, 20, 20, 20));

        // البطاقة الدائرية
        CardPanel card = new CardPanel();
        card.setLayout(new BorderLayout(10, 10));
        card.setPreferredSize(new Dimension(440, 200));
        card.setOpaque(false);

        // عنوان البوت
        JLabel title = new JLabel(botName);
        title.setFont(new Font("SansSerif", Font.BOLD, 28));
        title.setHorizontalAlignment(SwingConstants.RIGHT);
        title.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // وصف صغير
        JLabel subtitle = new JLabel("بوت ماسنجر متكامل");
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 14));
        subtitle.setHorizontalAlignment(SwingConstants.RIGHT);
        subtitle.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // سطر المطور
        JLabel dev = new JLabel(developer);
        dev.setFont(new Font("Dialog", Font.PLAIN, 20));
        dev.setHorizontalAlignment(SwingConstants.RIGHT);
        dev.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // أيقونة دائرية بسيطة (يمكن استبدال بصورة)
        Icon circleIcon = new CircleIcon(64);

        JPanel rightPanel = new JPanel(new BorderLayout());
        rightPanel.setOpaque(false);
        JPanel texts = new JPanel(new GridLayout(3, 1));
        texts.setOpaque(false);
        texts.add(title);
        texts.add(subtitle);
        texts.add(dev);
        texts.setBorder(new EmptyBorder(8, 8, 8, 8));

        JLabel iconLabel = new JLabel(circleIcon);
        iconLabel.setBorder(new EmptyBorder(8, 8, 8, 8));
        iconLabel.setHorizontalAlignment(SwingConstants.LEFT);

        card.add(texts, BorderLayout.CENTER);
        card.add(iconLabel, BorderLayout.WEST);

        bg.add(card);
        frame.add(bg, BorderLayout.CENTER);

        // تخصيص RTL للنافذة كلها (عربي)
        applyRightToLeft(frame);

        frame.setVisible(true);
    }

    private static void applyRightToLeft(Component c) {
        c.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        if (c instanceof Container) {
            for (Component child : ((Container) c).getComponents()) {
                applyRightToLeft(child);
            }
        }
    }

    // لوحة تدرّج خلفية
    static class GradientPanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g.create();
            int w = getWidth(), h = getHeight(
