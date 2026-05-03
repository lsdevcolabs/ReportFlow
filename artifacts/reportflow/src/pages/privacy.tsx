import { ArrowRight } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const sections = [
  {
    title: "1. Information we collect",
    content: `We collect information you provide directly to us when you create an account, use ReportFlow, or contact us for support.

Account information: When you register, we collect your name, email address, and authentication credentials managed securely through Clerk.

Report and client data: We store the client names, contact details, project types, brand colors, and performance metrics you input to generate reports. This data belongs to you.

Usage data: We collect anonymized information about how you use the service, including pages visited, features used, and actions taken. This helps us improve ReportFlow.

Device information: We may collect basic technical information such as browser type, device type, and IP address for security and analytics purposes.`,
  },
  {
    title: "2. How we use your information",
    content: `We use the information we collect to:

• Provide, maintain, and improve ReportFlow
• Create and manage your account
• Generate and store client reports on your behalf
• Send you transactional emails (account confirmation, password resets)
• Respond to your support requests and communications
• Detect and prevent fraud, abuse, and security incidents
• Comply with legal obligations

We do not sell your personal data to third parties. We do not use your data to train AI models. Your client data remains yours.`,
  },
  {
    title: "3. Data sharing and disclosure",
    content: `We share your information only in the following limited circumstances:

Service providers: We use trusted third-party services to help operate ReportFlow, including Clerk (authentication), PostgreSQL database hosting, and analytics tools. These providers are contractually obligated to protect your data.

Legal requirements: We may disclose information if required to do so by law, court order, or governmental authority, or where we believe disclosure is necessary to protect our rights, your safety, or the safety of others.

Business transfers: If LS DevCo is involved in a merger, acquisition, or asset sale, your information may be transferred. We will notify you before your data is transferred and becomes subject to a different privacy policy.

We never sell, rent, or trade your personal information to any third party for marketing purposes.`,
  },
  {
    title: "4. Data storage and security",
    content: `Your data is stored on secure, encrypted servers. We implement industry-standard security measures including:

• TLS/SSL encryption for all data in transit
• Encrypted storage at rest
• Access controls limiting who within LS DevCo can access user data
• Regular security reviews and updates

While we take reasonable steps to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but we commit to notifying you promptly in the event of any breach affecting your data.`,
  },
  {
    title: "5. Shared report links",
    content: `When you publish a report and share its link, that report becomes publicly accessible to anyone with the link. No login is required to view a shared report.

You can revoke public access at any time by unpublishing the report from the report detail page. Once unpublished, the shared link immediately stops working.

Please be mindful of the data you include in published reports, as the link can be forwarded by recipients.`,
  },
  {
    title: "6. Your rights",
    content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you
• Correction: Request correction of inaccurate or incomplete data
• Deletion: Request deletion of your personal data ("right to be forgotten")
• Portability: Request your data in a portable format
• Objection: Object to certain types of processing

To exercise any of these rights, contact us at privacy@reportflow.app. We will respond within 30 days.

You may delete your account at any time from the Settings page. Account deletion removes all your data from our systems within 30 days.`,
  },
  {
    title: "7. Cookies and tracking",
    content: `ReportFlow uses essential cookies required for authentication and session management. These cookies are necessary for the service to function and cannot be disabled.

We use minimal analytics to understand how users interact with the product. This data is anonymized and aggregated.

We do not use third-party advertising cookies or cross-site tracking technologies.`,
  },
  {
    title: "8. Children's privacy",
    content: `ReportFlow is not intended for use by children under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child under 16 has provided us with personal data, we will promptly delete that information. If you believe we may have inadvertently collected data from a child, please contact us at privacy@reportflow.app.`,
  },
  {
    title: "9. Changes to this policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make material changes, we will notify you by email or through a prominent notice in the application at least 14 days before the changes take effect.

Your continued use of ReportFlow after the effective date of the updated policy constitutes acceptance of the revised terms. We encourage you to review this policy periodically.`,
  },
  {
    title: "10. Contact us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal data, please contact us:

Email: privacy@reportflow.app
Company: LS DevCo
Product: ReportFlow

We take privacy matters seriously and will respond to all inquiries within 5 business days.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <a href={basePath || "/"} className="flex items-center gap-2.5 mr-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              RF
            </div>
            <span className="font-bold text-lg tracking-tight">ReportFlow</span>
          </a>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-muted-foreground">
            <a href={`${basePath}/about`} className="hover:text-foreground transition-colors">About</a>
            <a href={`${basePath}/contact`} className="hover:text-foreground transition-colors">Contact</a>
            <a href={`${basePath}/privacy`} className="text-foreground font-medium">Privacy</a>
          </nav>
          <div className="flex-1" />
          <a
            href={`${basePath}/sign-up`}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Get started free
          </a>
        </div>
      </header>

      {/* Header */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 text-center border-b bg-muted/10">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: <span className="font-medium text-foreground">May 3, 2026</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At LS DevCo, your privacy matters to us. This policy explains what data ReportFlow
            collects, how we use it, and your rights as a user. We've written it to be clear and
            easy to understand.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <section className="py-8 px-4 sm:px-6 bg-muted/5 border-b">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Jump to section</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((s, i) => (
            <div key={i} id={`section-${i}`} className="scroll-mt-20 space-y-3">
              <h2 className="text-xl font-bold">{s.title}</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                {s.content.split("\n").map((para, j) =>
                  para.trim() === "" ? null : (
                    <p key={j} className="leading-relaxed mb-2">
                      {para}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center bg-muted/10 border-t">
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-muted-foreground text-sm">
            Have questions about this policy or how we handle your data?
          </p>
          <a
            href={`${basePath}/contact`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors text-sm"
          >
            Contact our team <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">RF</div>
            <span>
              ReportFlow by <span className="font-semibold text-foreground">LS DevCo</span>
            </span>
          </div>
          <div className="flex gap-5">
            <a href={basePath || "/"} className="hover:text-foreground transition-colors">Home</a>
            <a href={`${basePath}/about`} className="hover:text-foreground transition-colors">About</a>
            <a href={`${basePath}/contact`} className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p>© 2026 LS DevCo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
