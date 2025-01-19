import { Request, Response } from 'express';
import Campaign from "../../models/Campaign";
import Message from "../../models/Message";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string): Promise<{ message: string }> => {
  const record = await Campaign.findOne({
    where: { id },
    include: [{ model: Message, where: { status: "Programado" }, required: false }]
  });

  if (!record) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  let warningMessage = "";

  // Verificar si la campaña está en progreso o programada
  if (record.status === "En Proceso" || record.status === "PROGRAMADA") {
    warningMessage = `Atención: La campaña con estado ${record.status} será eliminada.`;
  }

  // Eliminar solo los mensajes programados asociados a la campaña
  if (record.messages) {
    await Message.destroy({
      where: { 
        campaignId: id,
        status: "Programado"
      }
    });
  }

  // Eliminar la campaña
  await record.destroy();

  // Mensaje de confirmación
  const confirmationMessage = `Campaña ${id} Se eliminó exitosamente.`;

  // Combinar mensajes si hay una advertencia
  const finalMessage = warningMessage 
    ? `${warningMessage} ${confirmationMessage}`
    : confirmationMessage;

  // Aquí podrías añadir un log
  console.log(finalMessage);

  return { message: finalMessage };
};

// Función para manejar la solicitud HTTP
const handleDeleteCampaign = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const result = await DeleteService(id);
    return res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { DeleteService, handleDeleteCampaign };
