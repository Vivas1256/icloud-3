import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";

interface Data {
  name: string;
  status: string;
  confirmation: boolean;
  scheduledAt: string;
  companyId: number;
  contactListId: number;
  whatsappId: number;
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
  file1?: string;
  file2?: string;
  file3?: string;
  file4?: string;
  file5?: string;
}

const CreateService = async (data: Data): Promise<Campaign> => {
  const campaignSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "ERR_CAMPAIGN_INVALID_NAME")
      .max(100, "ERR_CAMPAIGN_NAME_TOO_LONG")
      .required("ERR_CAMPAIGN_NAME_REQUIRED"),
    status: Yup.string().oneOf(["Inactiva", "PROGRAMADA", "Proceso", "CANCELADA", "FINALIZADA"]),
    confirmation: Yup.boolean(),
    scheduledAt: Yup.date().nullable(),
    companyId: Yup.number().required("ERR_COMPANY_REQUIRED"),
    contactListId: Yup.number().required("ERR_CONTACT_LIST_REQUIRED"),
    whatsappId: Yup.number().required("ERR_WHATSAPP_REQUIRED"),
    message1: Yup.string().when("status", {
      is: (status) => status !== "Inactiva",
      then: Yup.string().required("ERR_CAMPAIGN_MESSAGE_REQUIRED"),
    }),
    fileListId: Yup.number().nullable(),
  });

  try {
    await campaignSchema.validate(data);
  } catch (err: any) {
    logger.error("Campaign validation error:", err);
    throw new AppError(err.message, 400);
  }

  try {
    // Check if a campaign with the same name already exists for this company
    const existingCampaign = await Campaign.findOne({
      where: { name: data.name, companyId: data.companyId }
    });

    if (existingCampaign) {
      throw new AppError("ERR_CAMPAIGN_NAME_ALREADY_EXISTS", 400);
    }

    if (data.scheduledAt != null && data.scheduledAt != "") {
      data.status = "PROGRAMADA";
    }

    const record = await Campaign.create(data);

    const messages = [
      { body: data.message1, file: data.file1 },
      { body: data.message2, file: data.file2 },
      { body: data.message3, file: data.file3 },
      { body: data.message4, file: data.file4 },
      { body: data.message5, file: data.file5 }
    ].filter(msg => msg.body || msg.file);

    for (let i = 0; i < messages.length; i++) {
      await Message.create({
        body: messages[i].body,
        mediaUrl: messages[i].file,
        campaignId: record.id,
        scheduledAt: data.scheduledAt 
          ? new Date(new Date(data.scheduledAt).getTime() + i * 60000) 
          : null,
        status: "Programado"
      });
    }

    if (data.confirmation) {
      const confirmationMessages = [
        { body: data.confirmationMessage1 },
        { body: data.confirmationMessage2 },
        { body: data.confirmationMessage3 },
        { body: data.confirmationMessage4 },
        { body: data.confirmationMessage5 }
      ].filter(msg => msg.body);

      for (let i = 0; i < confirmationMessages.length; i++) {
        await Message.create({
          body: confirmationMessages[i].body,
          campaignId: record.id,
          status: "Confirmación"
        });
      }
    }

    await record.reload({
      include: [
        { model: ContactList },
        { model: Whatsapp, attributes: ["id", "name"] },
        { 
          model: Message, 
          where: { 
            status: { [Op.in]: ["Programado", "Confirmación"] } 
          }, 
          required: false 
        }
      ]
    });

    logger.info(`Campaign created successfully: ${record.id}`);
    return record;
  } catch (err: any) {
    logger.error("Error creating campaign:", err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_CREATE_CAMPAIGN", 500);
  }
};

export default CreateService;
