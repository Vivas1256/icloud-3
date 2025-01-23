import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = Router();
const upload = multer(uploadConfig);

/**
 * Contact Management Routes
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact management endpoints
 */

// Import Phone Contacts
contactRoutes.post(
  "/contacts/import",
  isAuth,
  ImportPhoneContactsController.store
);

// Upload Contacts File
contactRoutes.post(
  "/contacts/upload",
  isAuth,
  upload.array("file"),
  ContactController.upload
);

// List All Contacts
contactRoutes.get(
  "/contacts",
  isAuth,
  ContactController.index
);

// Get Contacts List
contactRoutes.get(
  "/contacts/list",
  isAuth,
  ContactController.list
);

// Show Contact Details
contactRoutes.get(
  "/contacts/:contactId",
  isAuth,
  ContactController.show
);

// Create New Contact
contactRoutes.post(
  "/contacts",
  isAuth,
  ContactController.store
);

// Update Contact
contactRoutes.put(
  "/contacts/:contactId",
  isAuth,
  ContactController.update
);

// Delete Contact
contactRoutes.delete(
  "/contacts/:contactId",
  isAuth,
  ContactController.remove
);

// Get Contact VCard
contactRoutes.get(
  "/contact",
  isAuth,
  ContactController.getContactVcard
);

// Sync WhatsApp Contacts
contactRoutes.post(
  "/contacts/sync",
  isAuth,
  ContactController.syncContacts
);

// Import Contacts from Excel
contactRoutes.post(
  "/contacts/import-excel",
  isAuth,
  upload.single("file"),
  ContactController.importContactsFromExcel
);

// Export All Contacts
contactRoutes.get(
  "/contacts/export",
  isAuth,
  ContactController.exportContacts
);

// Export Contacts by Tag
contactRoutes.get(
  "/contacts/export/:tagId",
  isAuth,
  ContactController.exportContactsByTag
);

export default contactRoutes;
