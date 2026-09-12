import { LandRecordModel } from "../models/LandRecord";
import { DocumentModel } from "../models/Document";

export interface ExtractedDocumentFields {
  ownerName?: string;
  surveyNumber?: string;
  subdivisionNumber?: string;
  area?: number;
  village?: string;
  district?: string;
  documentNumber?: string;
  documentDate?: string;
}

export interface DiscrepancyResult {
  discrepancyCategory: 'OWNER_MISMATCH' | 'SURVEY_MISMATCH' | 'AREA_MISMATCH' | 'VILLAGE_MISMATCH' | 'DOCUMENT_DATE_ISSUE' | 'MISSING_FIELD' | 'NONE';
  verificationStatus: 'Verified' | 'Pending' | 'Mismatch' | 'Requires Review';
  fieldComparisons: Array<{
    field: string;
    databaseValue: any;
    extractedValue: any;
    matches: boolean;
  }>;
  riskImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  issuesDetected: string[];
}

export class DocumentAiProcessor {
  public static extractFieldsFromText(text: string): ExtractedDocumentFields {
    const fields: ExtractedDocumentFields = {};
    const textLower = text.toLowerCase();

    // Extract Survey Number (e.g. Survey 124/2 or Survey No. 124/2)
    const surveyMatch = text.match(/(?:survey\s*(?:no|number|\#)?\s*[:\.]?\s*)([0-9]+\/[0-9A-Za-z]+)/i);
    if (surveyMatch) {
      fields.surveyNumber = surveyMatch[1].trim();
    }

    // Extract Area (e.g. 2.4 Acres, 2.40 Hectares)
    const areaMatch = text.match(/([0-9]+\.?[0-9]*)\s*(acres|hectares|sq\s*ft)/i);
    if (areaMatch) {
      fields.area = parseFloat(areaMatch[1]);
    }

    // Extract Owner Name (e.g. Owner: R. Subramani, Shri K. Valarmathi)
    const ownerMatch = text.match(/(?:owner|name of owner|landowner|claimant)\s*[:\.]?\s*([A-Za-z\.\s]+)(?:\n|,|;)/i);
    if (ownerMatch) {
      fields.ownerName = ownerMatch[1].trim();
    }

    // Extract Village (e.g. Village: Koliyanur)
    const villageMatch = text.match(/(?:village|gramam)\s*[:\.]?\s*([A-Za-z\s]+)(?:\n|,|;)/i);
    if (villageMatch) {
      fields.village = villageMatch[1].trim();
    }

    return fields;
  }

  public static async compareWithDatabase(
    parcelId: string,
    extracted: ExtractedDocumentFields
  ): Promise<DiscrepancyResult> {
    const parcel = await LandRecordModel.findOne({ id: parcelId });

    if (!parcel) {
      return {
        discrepancyCategory: 'MISSING_FIELD',
        verificationStatus: 'Requires Review',
        fieldComparisons: [],
        riskImpact: 'Medium',
        issuesDetected: ["Associated land parcel ID not found in database."]
      };
    }

    const fieldComparisons: Array<{ field: string; databaseValue: any; extractedValue: any; matches: boolean }> = [];
    const issuesDetected: string[] = [];
    let hasMismatch = false;
    let discrepancyCategory: DiscrepancyResult['discrepancyCategory'] = 'NONE';

    // 1. Survey Number Check
    if (extracted.surveyNumber && parcel.surveyNumber) {
      const matches = extracted.surveyNumber.toLowerCase() === parcel.surveyNumber.toLowerCase();
      fieldComparisons.push({
        field: "Survey Number",
        databaseValue: parcel.surveyNumber,
        extractedValue: extracted.surveyNumber,
        matches
      });
      if (!matches) {
        hasMismatch = true;
        discrepancyCategory = 'SURVEY_MISMATCH';
        issuesDetected.push(`Survey Number mismatch: Document has "${extracted.surveyNumber}", Database has "${parcel.surveyNumber}"`);
      }
    }

    // 2. Land Area Check
    if (extracted.area && parcel.landArea) {
      const diff = Math.abs(extracted.area - parcel.landArea);
      const matches = diff <= 0.05; // 0.05 acre tolerance
      fieldComparisons.push({
        field: "Land Area (Acres)",
        databaseValue: parcel.landArea,
        extractedValue: extracted.area,
        matches
      });
      if (!matches) {
        hasMismatch = true;
        if (discrepancyCategory === 'NONE') discrepancyCategory = 'AREA_MISMATCH';
        issuesDetected.push(`Land Area discrepancy: Document states ${extracted.area} Acres, Database records ${parcel.landArea} Acres`);
      }
    }

    // 3. Owner Name Check
    if (extracted.ownerName && parcel.ownerName) {
      const matches = parcel.ownerName.toLowerCase().includes(extracted.ownerName.toLowerCase()) ||
                      extracted.ownerName.toLowerCase().includes(parcel.ownerName.toLowerCase());
      fieldComparisons.push({
        field: "Owner Name",
        databaseValue: parcel.ownerName,
        extractedValue: extracted.ownerName,
        matches
      });
      if (!matches) {
        hasMismatch = true;
        if (discrepancyCategory === 'NONE') discrepancyCategory = 'OWNER_MISMATCH';
        issuesDetected.push(`Landowner Name mismatch: Document has "${extracted.ownerName}", Database lists "${parcel.ownerName}"`);
      }
    }

    const verificationStatus = hasMismatch ? 'Mismatch' : (fieldComparisons.length > 0 ? 'Verified' : 'Pending');
    const riskImpact = hasMismatch ? 'High' : 'Low';

    return {
      discrepancyCategory,
      verificationStatus,
      fieldComparisons,
      riskImpact,
      issuesDetected
    };
  }
}
