import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as ContactListController from "../controllers/ContactListController";

const routes = Router();
const upload = multer(uploadConfig);

/**
 * Contact Lists Routes
 * @swagger
 * tags:
 *   name: Contact Lists
 *   description: Contact list management endpoints
 */

// List Routes
routes.get(
  "/contact-lists/list",
  isAuth,
  ContactListController.findList
);

// Index Route
routes.get(
  "/contact-lists",
  isAuth,
  ContactListController.index
);

// Show Route
routes.get(
  "/contact-lists/:id",
  isAuth,
  ContactListController.show
);

// Store Route
routes.post(
  "/contact-lists",
  isAuth,
  ContactListController.store
);

// Upload Route
routes.post(
  "/contact-lists/:id/upload",
  isAuth,
  upload.array("file"),
  ContactListController.upload
);

// Update Route
routes.put(
  "/contact-lists/:id",
  isAuth,
  ContactListController.update
);

// Delete Route
routes.delete(
  "/contact-lists/:id",
  isAuth,
  ContactListController.remove
);

// Sync WhatsApp Contacts Route
routes.post(
  "/contact-lists/sync",
  isAuth,
  ContactListController.syncContacts
);

// Import Contacts from Excel Route
routes.post(
  "/contact-lists/import",
  isAuth,
  upload.single("file"),
  ContactListController.importContacts
);

// Export All Contacts Route
routes.get(
  "/contact-lists/export",
  isAuth,
  ContactListController.exportAllContacts
);

// Export Specific Contact List Route
routes.get(
  "/contact-lists/:id/export",
  isAuth,
  ContactListController.exportContacts
);

export default routes;