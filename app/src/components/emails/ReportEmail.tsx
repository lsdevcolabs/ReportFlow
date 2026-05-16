import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from "@react-email/components";

interface ReportEmailProps {
  reportTitle: string;
  clientName: string;
  dateRange: string;
  shareUrl: string;
  brandColor: string;
  message?: string;
  metrics?: {
    sessions?: number;
    conversions?: number;
    revenue?: number;
    previousSessions?: number;
  };
  agencyName?: string;
  isWhiteLabel?: boolean;
}

export function ReportEmail({
  reportTitle,
  clientName,
  dateRange,
  shareUrl,
  brandColor,
  message,
  metrics,
  agencyName,
  isWhiteLabel,
}: ReportEmailProps) {
  const sessionsChange =
    metrics?.sessions && metrics?.previousSessions
      ? Math.round(
          ((metrics.sessions - metrics.previousSessions) /
            metrics.previousSessions) *
            100
        )
      : null;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>
              {isWhiteLabel && agencyName ? agencyName : "ReportFlow"}
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {clientName},</Text>

            {message ? (
              <Text style={paragraph}>{message}</Text>
            ) : (
              <Text style={paragraph}>
                Your performance report for <strong>{dateRange}</strong> is ready
                to view.
              </Text>
            )}

            <Text style={reportTitleStyle}>{reportTitle}</Text>

            {/* Metrics Cards */}
            {metrics && (
              <Section style={metricsContainer}>
                {metrics.sessions !== undefined && (
                  <Section style={metricCard}>
                    <Text style={metricValue}>
                      {metrics.sessions.toLocaleString()}
                    </Text>
                    <Text style={metricLabel}>Sessions</Text>
                    {sessionsChange !== null && (
                      <Text
                        style={{
                          ...metricChange,
                          color: sessionsChange >= 0 ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {sessionsChange >= 0 ? "+" : ""}
                        {sessionsChange}%
                      </Text>
                    )}
                  </Section>
                )}
                {metrics.conversions !== undefined && (
                  <Section style={metricCard}>
                    <Text style={metricValue}>
                      {metrics.conversions.toLocaleString()}
                    </Text>
                    <Text style={metricLabel}>Conversions</Text>
                  </Section>
                )}
                {metrics.revenue !== undefined && (
                  <Section style={metricCard}>
                    <Text style={metricValue}>
                      ${metrics.revenue.toLocaleString()}
                    </Text>
                    <Text style={metricLabel}>Revenue</Text>
                  </Section>
                )}
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                href={shareUrl}
                style={{
                  ...button,
                  backgroundColor: brandColor || "#2563EB",
                }}
              >
                View Full Report
              </Button>
            </Section>

            <Text style={linkText}>
              Or copy this link:{" "}
              <a href={shareUrl} style={link}>
                {shareUrl}
              </a>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            {!isWhiteLabel && (
              <Text style={footerText}>
                Powered by{" "}
                <a href="https://reportflow.app" style={link}>
                  ReportFlow
                </a>
              </Text>
            )}
            {isWhiteLabel && agencyName && (
              <Text style={footerText}>{agencyName}</Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "24px 32px",
  borderBottom: "1px solid #e6ebf1",
};

const headerTitle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const content = {
  padding: "32px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  margin: "0 0 24px",
};

const reportTitleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const metricsContainer = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  margin: "0 0 32px",
};

const metricCard = {
  flex: "1",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
};

const metricValue = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0 0 4px",
};

const metricLabel = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const metricChange = {
  fontSize: "14px",
  fontWeight: "600",
  margin: "4px 0 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const linkText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#2563EB",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "0",
};

const footer = {
  padding: "24px 32px",
};

const footerText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
  textAlign: "center" as const,
};
