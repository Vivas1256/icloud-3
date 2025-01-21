import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import * as Yup from 'yup';
import { Op } from 'sequelize';

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
  status: Yup.string().oneOf(['Inactiva', 'PROGRAMADA', 'Proceso', 'PAUSADA', 'CANCELADA', 'FINALIZADA'], "Status inválido"),
  scheduledAt: Yup.date().nullable(),
  contactListId: Yup.number().positive("ID de lista de contactos inválido"),
  // ... añadir validaciones para otros campos según sea necesario
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

  // Si la campaña se está pausando
  if (originalStatus === 'Proceso' && data.status === 'PAUSADA') {
    await Message.update(
      { status: 'PENDIENTE' },
      { 
        where: { 
          campaignId: id, 
          status: 'PROGRAMADO',
          scheduledAt: { [Op.gt]: new Date() } // Solo pausar mensajes futuros
        } 
      }
    );
  }

  // Si la campaña se está reanudando
  if (originalStatus === 'PAUSADA' && data.status === 'Proceso') {
    await Message.update(
      { status: 'PROGRAMADO' },
      { 
        where: { 
          campaignId: id, 
          status: 'PENDIENTE' 
        } 
      }
    );
  }

  // Actualizar la campaña conservando los datos existentes
  const updatedCampaign = await campaign.update({
    ...campaign.toJSON(),
    ...data
  });

  await updatedCampaign.reload({
    include: [
      { model: ContactList },
      { model: Whatsapp, attributes: ["id", "name"] }
    ]
  });

  return updatedCampaign;
};

export default UpdateService;
