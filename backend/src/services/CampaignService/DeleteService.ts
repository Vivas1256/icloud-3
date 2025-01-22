import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string): Promise<void> => {
  const record = await Campaign.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  if (record.status === "Proceso") {
    throw new AppError("No se permite eliminar una campaña en proceso", 400);
  }

  await record.destroy();
};

export default DeleteService;
