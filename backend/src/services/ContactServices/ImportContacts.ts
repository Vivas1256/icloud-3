import { head, has } from "lodash";
import XLSX from "xlsx";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import CheckContactNumber from "../WbotServices/CheckNumber";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface ContactData {
  name: string;
  number: string;
  email: string;
  tags: string[];
  companyId: number;
}

interface TagInstance extends Tag {
  name: string;
  color: string;
  companyId: number;
}

export async function ImportContacts(
  companyId: number,
  file: Express.Multer.File | undefined
): Promise<Contact[]> {
  if (!file) {
    throw new AppError("File is required", 400);
  }

  try {
    const contacts = await parseExcelFile(file, companyId);
    return await processContacts(contacts);
  } catch (error) {
    logger.error(`Error importing contacts: ${error}`);
    throw new AppError("Error processing contact import", 500);
  }
}

async function parseExcelFile(
  file: Express.Multer.File,
  companyId: number
): Promise<ContactData[]> {
  const workbook = XLSX.readFile(file.path);
  const worksheet = head(Object.values(workbook.Sheets));
  
  if (!worksheet) {
    throw new AppError("Invalid worksheet", 400);
  }

  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
  return rows.map(row => parseContactRow(row, companyId));
}

function parseContactRow(row: any, companyId: number): ContactData {
  return {
    name: extractField(row, ["nome", "Nome"]),
    number: normalizePhoneNumber(
      extractField(row, ["numero", "número", "Numero", "Número"])
    ),
    email: extractField(row, ["email", "e-mail", "Email", "E-mail"]),
    tags: extractTags(row),
    companyId
  };
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

async function processContacts(contacts: ContactData[]): Promise<Contact[]> {
  const contactList: Contact[] = [];

  for (const contact of contacts) {
    try {
      const [newContact, created] = await Contact.findOrCreate({
        where: {
          number: contact.number,
          companyId: contact.companyId
        },
        defaults: contact
      });

      await processTags(newContact, contact.tags, contact.companyId);

      if (created) {
        await validateWhatsAppNumber(newContact);
        contactList.push(newContact);
      }
    } catch (error) {
      logger.error(`Error processing contact ${contact.number}: ${error}`);
    }
  }

  return contactList;
}

async function processTags(
  contact: Contact,
  tagNames: string[],
  companyId: number
): Promise<void> {
  const existingTags = await contact.getTags();
  const existingTagNames = existingTags.map(tag => tag.name);

  for (const tagName of tagNames) {
    if (!existingTagNames.includes(tagName)) {
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
}

async function validateWhatsAppNumber(contact: Contact): Promise<void> {
  try {
    const response = await CheckContactNumber(contact.number, contact.companyId);
    contact.number = response.jid.replace(/\D/g, "");
    await contact.save();
  } catch (error) {
    logger.error(`Invalid contact number: ${contact.number}`);
  }
}
