import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

export default function PrivacyPolicyScreen() {
  const colors = useThemeStore((s) => s.colors);

  const Section = ({ title, children }: { title: string; children: string }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
      <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>Last updated: April 2026</Text>

      <Section title="1. Who We Are">
        {`PingTask ("we", "us", "our") is a messaging and task management application built in Dubai, UAE. We are committed to protecting your personal data in compliance with the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) and international best practices.`}
      </Section>

      <Section title="2. What Data We Collect">
        {`We collect and process the following personal data:

• Account information: Email address, display name, profile photo, and your unique 8-character PIN.
• Messages: Your messages are end-to-end encrypted (E2EE) using Curve25519 + XSalsa20-Poly1305. We cannot read the content of your direct messages. Only encrypted ciphertext is stored on our servers.
• Contacts: The PINs or identifiers of users you add as contacts.
• Tasks: Task titles and assignments created via @mentions in chats.
• Usage data: App settings, notification preferences, online status, and last seen timestamps.
• Device information: Device type and push notification tokens (if you enable notifications).

We do NOT collect: phone numbers (unless you voluntarily add one), location data, browsing history, or financial information.`}
      </Section>

      <Section title="3. Why We Process Your Data">
        {`We process your data for the following purposes:

• To provide the messaging and task management service (contractual necessity).
• To deliver push notifications you have opted into (consent).
• To maintain app security and prevent abuse (legitimate interest).
• To improve the app experience (anonymized analytics, if any).

We follow the principle of data minimization — we only collect what is strictly necessary to provide the service.`}
      </Section>

      <Section title="4. End-to-End Encryption">
        {`Direct messages in PingTask are encrypted using NaCl box encryption (Curve25519 key exchange + XSalsa20-Poly1305 authenticated encryption).

• Your private encryption key is stored only on your device — never on our servers.
• Our servers store only encrypted ciphertext — we cannot read, modify, or share your message content.
• Group messages may not be E2EE in the current version.

This means that even if our servers were compromised, your message content would remain unreadable.`}
      </Section>

      <Section title="5. Data Storage & Third Parties">
        {`Your data is stored using Google Firebase services (Firestore, Authentication, Storage, Cloud Functions), hosted by Google LLC. Data may be transferred to and stored in data centers outside the UAE.

We ensure appropriate safeguards for cross-border transfers in compliance with UAE PDPL requirements.

Third-party services we use:
• Firebase Authentication — for account management
• Firebase Firestore — for data storage (encrypted messages, contacts, tasks)
• Firebase Cloud Storage — for profile photos
• Firebase Cloud Messaging — for push notifications
• Expo — for app delivery and updates

We do not sell, rent, or share your personal data with third parties for marketing purposes.`}
      </Section>

      <Section title="6. Your Rights">
        {`Under the UAE PDPL, you have the right to:

• Access: Request a copy of your personal data.
• Rectification: Correct inaccurate data (via Edit Profile).
• Erasure: Request deletion of your account and all associated data.
• Restriction: Request we limit processing of your data.
• Portability: Receive your data in a structured format.
• Objection: Object to processing based on legitimate interest.

To exercise these rights, use the "Delete Account" option in Settings > Data Management, or contact us at privacy@pingtask.app.`}
      </Section>

      <Section title="7. Data Retention">
        {`• Account data is retained as long as your account is active.
• Messages are retained in encrypted form until you delete them or use disappearing messages.
• When you delete your account, we remove all your personal data from our servers within 30 days.
• Backup copies may persist for up to 90 days before being permanently erased.`}
      </Section>

      <Section title="8. Children's Privacy">
        {`PingTask is not intended for children under 13 years of age. In compliance with the UAE Child Digital Safety Law (effective 2026), we do not knowingly collect data from children under 13. If we learn that we have collected data from a child under 13, we will promptly delete it.`}
      </Section>

      <Section title="9. Security Measures">
        {`We implement appropriate technical and organizational security measures:

• End-to-end encryption for messages
• Biometric app lock option (Face ID / Fingerprint)
• Firestore security rules enforcing authentication and ownership
• Encrypted data in transit (TLS) and at rest
• Minimal data collection and storage`}
      </Section>

      <Section title="10. Changes to This Policy">
        {`We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. Your continued use of PingTask after changes constitutes acceptance of the updated policy.`}
      </Section>

      <Section title="11. Contact Us">
        {`For privacy-related questions or to exercise your data rights:

Email: privacy@pingtask.app
Location: Dubai, United Arab Emirates`}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: 60 },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, marginBottom: spacing.xs },
  lastUpdated: { fontSize: typography.fontSize.sm, marginBottom: spacing.xxl },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  body: { fontSize: typography.fontSize.md, lineHeight: 22 },
});
