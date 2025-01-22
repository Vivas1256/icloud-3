import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowService from "./ShowService";

interface TagData {
  name?: string;
  color?: string;
  kanban?: number;
}

interface Request {
  tagData: TagData;
  id: string | number;
}

const UpdateTagService = async ({
  tagData,
  id
}: Request): Promise<Tag> => {
  const tag = await ShowService(id);

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(3, "Name should have at least 3 characters"),
    color: Yup.string().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
    kanban: Yup.number().min(0, "Kanban value should be non-negative")
  });

  const { name, color, kanban } = tagData;

  try {
    await schema.validate({ name, color, kanban }, { abortEarly: false });
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new AppError(err.errors.join(", "));
    }
    throw new AppError("Validation error");
  }

  await tag.update({
    name: name || tag.name,
    color: color || tag.color,
    kanban: kanban !== undefined ? kanban : tag.kanban
  });

  await tag.reload();
  return tag;
};

export default UpdateTagService;
