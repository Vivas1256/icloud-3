import { head, has } from "lodash";
import XLSX from "xlsx";
import ContactListItem from "../../models/ContactListItem";
import Tag from "../../models/Tag";
import CheckContactNumber from "../WbotServices/CheckNumber";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface ContactData {
  name: string;
  number: string;
  email: string;
  tags: string[];
  contactListId: number;
  companyId: number;
}

export async function ImportContacts(
  contactListId: number,
  companyId: number,
  file: Express.Multer.File | undefined
): Promise<ContactListItem[]> {
  if (!file) {
    throw new AppError("File is required", 400);
  }

  try {
    const workbook = XLSX.readFile(file.path);
    const worksheet = head(Object.values(workbook.Sheets));
    
    if (!worksheet) {
      throw new AppError("Invalid worksheet", 400);
    }

    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
    const contacts: ContactData[] = parseContactRows(rows, contactListId, companyId);
    return await processContacts(contacts, companyId);
  } catch (error) {
    logger.error(`Error importing contacts: ${error}`);
    throw new AppError("Error processing contact import", 500);
  }
}

function parseContactRows(
  rows: any[],
  contactListId: number,
  companyId: number
): ContactData[] {
  return rows.map(row => {
    const name = extractField(row, ["nome", "Nome"]);
    const number = normalizePhoneNumber(
      extractField(row, ["numero", "número", "Numero", "Número"])
    );
    const email = extractField(row, ["email", "e-mail", "Email", "E-mail"]);
    const tags = extractTags(row);

    return { name, number, email, tags, contactListId, companyId };
  });
}

function extractField(row: any, possibleFields: string[]): string {
  for (const field of possibleFields) {
    if (has(row, field)) {
      return row[field] || "";
    }
  }
  return "";
}

function normalizePhoneNumber(number: string): string {
  return `${number}`.replace(/\D/g, "");
}

function extractTags(row: any): string[] {
  const tagField = has(row, "tags") ? "tags" : has(row, "Tags") ? "Tags" : null;
  if (!tagField || !row[tagField]) return [];
  return row[tagField].split(',').map((tag: string) => tag.trim());
}

async function processContacts(
  contacts: ContactData[],
  companyId: number
): Promise<ContactListItem[]> {
  const contactList: ContactListItem[] = [];

  for (const contact of contacts) {
    try {
      const [newContact, created] = await ContactListItem.findOrCreate({
        where: {
          number: contact.number,
          contactListId: contact.contactListId,
          companyId: contact.companyId
        },
        defaults: contact
      });

      if (created) {
        await processContactTags(newContact, contact.tags, companyId);
        await validateWhatsAppNumber(newContact, companyId);
        contactList.push(newContact);
      }
    } catch (error) {
      logger.error(`Error processing contact ${contact.number}: ${error}`);
    }
  }

  return contactList;
}

async function processContactTags(
  contact: ContactListItem,
  tagNames: string[],
  companyId: number
): Promise<void> {
  for (const tagName of tagNames) {
    const [tag] = await Tag.findOrCreate({
      where: { name: tagName, companyId },
      defaults: { 
        name: tagName, 
        color: "#000000", 
        companyId 
      }
    });
    await contact.addTag(tag);
  }
}

async function validateWhatsAppNumber(
  contact: ContactListItem,
  companyId: number
): Promise<void> {
  try {
    const response = await CheckContactNumber(contact.number, companyId);
    contact.isWhatsappValid = response.exists;
    contact.number = response.jid.replace(/\D/g, "");
    await contact.save();
  } catch (error) {
    logger.error(`Invalid contact number: ${contact.number}`);
    contact.isWhatsappValid = false;
    await contact.save();
  }
}
