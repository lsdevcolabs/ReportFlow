import { Router } from "express";
import { getAuth } from "@clerk/express";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

interface ParsedMetrics {
  organicTraffic?: number | null;
  paidTraffic?: number | null;
  conversions?: number | null;
  conversionRate?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  spend?: number | null;
  roas?: number | null;
  socialFollowers?: number | null;
  socialEngagement?: number | null;
  emailSubscribers?: number | null;
  emailOpenRate?: number | null;
  previousOrganicTraffic?: number | null;
  previousConversions?: number | null;
  previousSpend?: number | null;
}

const COLUMN_MAPPINGS: Record<string, keyof ParsedMetrics> = {
  "organic traffic": "organicTraffic",
  "organic visits": "organicTraffic",
  "organic sessions": "organicTraffic",
  "organic": "organicTraffic",
  "paid traffic": "paidTraffic",
  "paid visits": "paidTraffic",
  "paid sessions": "paidTraffic",
  "paid": "paidTraffic",
  "conversions": "conversions",
  "leads": "conversions",
  "sales": "conversions",
  "goals": "conversions",
  "conversion rate": "conversionRate",
  "conv rate": "conversionRate",
  "cr": "conversionRate",
  "impressions": "impressions",
  "impression": "impressions",
  "clicks": "clicks",
  "click": "clicks",
  "ctr": "ctr",
  "click-through rate": "ctr",
  "spend": "spend",
  "cost": "spend",
  "ad spend": "spend",
  "roas": "roas",
  "return on ad spend": "roas",
  "social followers": "socialFollowers",
  "followers": "socialFollowers",
  "social engagement": "socialEngagement",
  "engagement rate": "socialEngagement",
  "engagement": "socialEngagement",
  "email subscribers": "emailSubscribers",
  "subscribers": "emailSubscribers",
  "email open rate": "emailOpenRate",
  "open rate": "emailOpenRate",
  "previous organic traffic": "previousOrganicTraffic",
  "previous organic": "previousOrganicTraffic",
  "previous conversions": "previousConversions",
  "previous leads": "previousConversions",
  "previous spend": "previousSpend",
  "previous cost": "previousSpend",
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
}

function parseValue(header: string, value: string): number | null {
  if (!value || value === "-" || value === "") return null;
  
  const normalizedHeader = normalizeHeader(header);
  let cleanValue = value.replace(/[^0-9.-]/g, "");
  
  if (normalizedHeader.includes("rate") || normalizedHeader.includes("ctr") || normalizedHeader.includes("roas")) {
    const percentMatch = value.match(/(\d+(\.\d+)?)\s*%/);
    if (percentMatch) return parseFloat(percentMatch[1]);
    return parseFloat(cleanValue);
  }
  
  if (normalizedHeader.includes("spend") || normalizedHeader.includes("cost")) {
    const dollarMatch = value.match(/\$?([0-9,]+(\.[0-9]+)?)/);
    if (dollarMatch) return parseFloat(dollarMatch[1].replace(/,/g, ""));
    return parseFloat(cleanValue.replace(/,/g, ""));
  }
  
  return parseFloat(cleanValue.replace(/,/g, ""));
}

function mapCsvToMetrics(headers: string[], values: string[]): ParsedMetrics {
  const metrics: ParsedMetrics = {};
  
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    const mappedKey = COLUMN_MAPPINGS[normalized];
    
    if (mappedKey && values[index]) {
      const parsedValue = parseValue(header, values[index]);
      if (parsedValue !== null && !isNaN(parsedValue)) {
        (metrics as any)[mappedKey] = parsedValue;
      }
    }
  });
  
  return metrics;
}

// Simple CSV parser without external dependency
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    return line.split(',').map(cell => cell.trim());
  });
  return { headers, rows };
}

router.post("/upload", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { csv } = req.body;
    
    if (!csv || typeof csv !== "string") {
      res.status(400).json({ error: "CSV content required in 'csv' field" });
      return;
    }

    const { headers, rows } = parseCsv(csv);
    
    if (!rows || rows.length === 0) {
      res.status(400).json({ 
        error: "Invalid CSV", 
        message: "CSV must have headers and at least one row of data" 
      });
      return;
    }

    const values = rows[0];
    const metrics = mapCsvToMetrics(headers, values);

    const foundColumns: string[] = [];
    headers.forEach((header) => {
      const normalized = normalizeHeader(header);
      if (COLUMN_MAPPINGS[normalized]) {
        foundColumns.push(header);
      }
    });

    if (foundColumns.length === 0) {
      res.status(400).json({
        error: "NO_MATCHING_COLUMNS",
        message: "No recognized metric columns found in CSV",
        availableColumns: headers,
        requiredColumns: Object.keys(COLUMN_MAPPINGS),
      });
      return;
    }

    res.json({
      data: metrics,
      mappedColumns: foundColumns,
      rowCount: rows.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to parse CSV");
    res.status(500).json({ error: "Failed to parse CSV" });
  }
});

export default router;