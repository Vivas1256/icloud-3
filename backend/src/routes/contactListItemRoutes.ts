import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ContactListItemController from "../controllers/ContactListItemController";

const routes = express.Router();
const upload = multer(uploadConfig);

// Rutas existentes
routes.get(
  "/contact-list-items/list",
  isAuth,
  ContactListItemController.findList
);

routes.get("/contact-list-items", isAuth, ContactListItemController.index);

routes.get("/contact-list-items/:id", isAuth, ContactListItemController.show);

routes.post("/contact-list-items", isAuth, ContactListItemController.store);

routes.put("/contact-list-items/:id", isAuth, ContactListItemController.update);

routes.delete(
  "/contact-list-items/:id",
  isAuth,
  ContactListItemController.remove
);

// Nuevas rutas

// Ruta para sincronizar contactos de WhatsApp
routes.post(
  "/contact-list-items/sync",
  isAuth,
  ContactListItemController.syncContacts
);

// Ruta para importar contactos desde Excel
routes.post(
  "/contact-list-items/import",
  isAuth,
  upload.single("file"),
  ContactListItemController.importContacts
);

// Ruta para exportar contactos
routes.get(
  "/contact-list-items/export",
  isAuth,
  ContactListItemController.exportContacts
);

// Ruta para exportar elementos específicos de la lista de contactos
routes.get(
  "/contact-list-items/:id/export",
  isAuth,
  ContactListItemController.exportItems
);

export default routes;
