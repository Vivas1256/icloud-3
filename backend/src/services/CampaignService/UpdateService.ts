import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import * as Yup from 'yup';
import { Op } from 'sequelize';
import Message from "../../models/Message";

interface UpdateData {
  id: number | string;
  name?: string;
  status?: string;
  confirmation?: boolean;
  scheduledAt?: string;
  companyId?: number;
  contactListId?: number;
  message1?: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;
  confirmationMessage1?: string;
  confirmationMessage2?: string;
  confirmationMessage3?: string;
  confirmationMessage4?: string;
  confirmationMessage5?: string;
  fileListId?: number;
}

const updateSchema = Yup.object().shape({
  name: Yup.string().min(3, "Nombre demasiado corto"),
  status: Yup.string().oneOf(['INACTIVA', 'PROGRAMADA', 'EN PROCESO', 'CANCELADA', 'FINALIZADA'], "Status inválido"),
  scheduledAt: Yup.date().nullable(),
  contactListId: Yup.number().positive("ID da lista de contatos inválido"),
  message1: Yup.string(),
  // ... adicione validações para outros campos conforme necessário
});

const UpdateService = async (data: UpdateData): Promise<Campaign> => {
  const { id } = data;

  const campaign = await Campaign.findByPk(id);

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  try {
    await updateSchema.validate(data);
  } catch (err) {
    throw new AppError(err.message, 400);
  }

  const originalStatus = campaign.status;

  // Si la campaña estaba en progreso y se está actualizando, pausarla
  if (originalStatus === 'EN PROCESO' && data.status !== 'EN PROCESO') {
    await Message.update(
      { status: 'PENDIENTE' },
      { where: { campaignId: id, status: 'PROGRAMADO' } }
    );
    data.status = 'PROGRAMADA';
  }

  // Actualizar la campaña
  await campaign.update(data);

  // Si la campaña se está reanudando, actualizar los mensajes pendientes
  if (originalStatus !== 'EN PROCESO' && data.status === 'EN PROCESO') {
    await Message.update(
      { 
        body: data.message1, // Actualizar con el nuevo mensaje
        status: 'PROGRAMADO'
      },
      { 
        where: { 
          campaignId: id, 
          status: 'PENDIENTE',
          scheduledAt: { [Op.gt]: new Date() } // Solo actualizar mensajes futuros
        } 
      }
    );
  }

  await campaign.reload({
    include: [
      { model: ContactList },
      { model: Whatsapp, attributes: ["id", "name"] }
    ]
  });

  return campaign;
};

export default UpdateService;
