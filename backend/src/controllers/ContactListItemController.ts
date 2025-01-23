import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListService from "../services/ContactListItemService/ListService";
import CreateService from "../services/ContactListItemService/CreateService";
import ShowService from "../services/ContactListItemService/ShowService";
import UpdateService from "../services/ContactListItemService/UpdateService";
import DeleteService from "../services/ContactListItemService/DeleteService";
import FindService from "../services/ContactListItemService/FindService";
import SyncService from "../services/ContactListItemService/SyncService";
import ImportService from "../services/ContactListItemService/ImportService";
import ExportService from "../services/ContactListItemService/ExportService";

import ContactListItem from "../models/ContactListItem";
import AppError from "../errors/AppError";

interface IndexQuery {
  searchParam: string;
  pageNumber: string;
  companyId: string | number;
  contactListId: string | number;
}

interface StoreData {
  name: string;
  number: string;
  contactListId: number;
  companyId?: string;
  email?: string;
}

interface FindParams {
  companyId: number;
  contactListId: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, contactListId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { contacts, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId,
    contactListId
  });

  return res.json({ contacts, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string().required(),
    contactListId: Yup.number().required()
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : 'Validation error');
  }

  const record = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-ContactListItem`, {
    action: "create",
    record
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;
  const { id } = req.params;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : 'Validation error');
  }

  const record = await UpdateService({
    ...data,
    id
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-ContactListItem`, {
    action: "update",
    record
  });

  return res.status(200).json(record);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(id);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-ContactListItem`, {
    action: "delete",
    id
  });

  return res.status(200).json({ message: "Contact deleted" });
};

export const findList = async (req: Request, res: Response): Promise<Response> => {
  const params = req.query as unknown as FindParams;
  const records: ContactListItem[] = await FindService(params);

  return res.status(200).json(records);
};

export const syncContacts = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    const result = await SyncService(companyId);
    return res.status(200).json(result);
  } catch (err) {
    throw new AppError("Error syncing contacts", 500);
  }
};

export const importContacts = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const file = req.file;

  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  try {
    const result = await ImportService(companyId, file);
    return res.status(200).json(result);
  } catch (err) {
    throw new AppError("Error importing contacts", 500);
  }
};

export const exportContacts = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  try {
    const result = await ExportService(companyId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');
    return res.send(result);
  } catch (err) {
    throw new AppError("Error exporting contacts", 500);
  }
};

export const exportItems = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  
  try {
    const result = await ExportService(companyId, id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=contact_items.xlsx');
    return res.send(result);
  } catch (err) {
    throw new AppError("Error exporting contact items", 500);
  }
};
