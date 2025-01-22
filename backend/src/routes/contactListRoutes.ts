import express from "express";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as ContactListController from "../controllers/ContactListController";
import multer from "multer";

const routes = express.Router();

const upload = multer(uploadConfig);

// Rutas existentes
routes.get("/contact-lists/list", isAuth, ContactListController.findList);

routes.get("/contact-lists", isAuth, ContactListController.index);

routes.get("/contact-lists/:id", isAuth, ContactListController.show);

routes.post("/contact-lists", isAuth, ContactListController.store);

routes.post(
  "/contact-lists/:id/upload",
  isAuth,
  upload.array("file"),
  ContactListController.upload
);

routes.put("/contact-lists/:id", isAuth, ContactListController.update);

routes.delete("/contact-lists/:id", isAuth, ContactListController.remove);

// Rutas nuevas o modificadas

// Ruta para sincronizar contactos de WhatsApp
routes.post("/contact-lists/sync", isAuth, ContactListController.syncContacts);

// Ruta para importar contactos desde Excel
routes.post(
  "/contact-lists/import",
  isAuth,
  upload.single("file"),
  ContactListController.importContacts
);

// Ruta para exportar todos los contactos
routes.get("/contact-lists/export", isAuth, ContactListController.exportAllContacts);

// Ruta para exportar contactos de una lista específica
routes.get("/contact-lists/:id/export", isAuth, ContactListController.exportContacts);

export default routes;