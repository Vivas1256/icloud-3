import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";
import routes from "./contactListRoutes";
import uploadConfig from "../config/upload";
import multer from "multer";

const contactRoutes = express.Router();

const upload = multer(uploadConfig);

// Rutas existentes
contactRoutes.post(
  "/contacts/import",
  isAuth,
  ImportPhoneContactsController.store
);

routes.post(
  "/contacts/upload",
  isAuth,
  upload.array("file"),
  ContactController.upload
);

contactRoutes.get("/contacts", isAuth, ContactController.index);

contactRoutes.get("/contacts/list", isAuth, ContactController.list);

contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);

contactRoutes.post("/contacts", isAuth, ContactController.store);

contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);

contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);

contactRoutes.get("/contact", isAuth, ContactController.getContactVcard);

// Rutas nuevas o modificadas

// Ruta para sincronizar contactos de WhatsApp
contactRoutes.post("/contacts/sync", isAuth, ContactController.syncContacts);

// Ruta para importar contactos desde Excel
contactRoutes.post(
  "/contacts/import-excel",
  isAuth,
  upload.single("file"),
  ContactController.importContactsFromExcel
);

// Ruta para exportar todos los contactos
contactRoutes.get("/contacts/export", isAuth, ContactController.exportContacts);

// Ruta para exportar contactos por etiqueta
contactRoutes.get("/contacts/export/:tagId", isAuth, ContactController.exportContactsByTag);

export default contactRoutes;
