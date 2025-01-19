import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";

interface Data {
  name: string;
  status: string;
  confirmation: boolean;
  scheduledAt: string;
  companyId: number;
  contactListId: number;
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
  fileListId: number;
  file1?: string;
  file2?: string;
  file3?: string;
  file4?: string;
  file5?: string;
}

const CreateService = async (data: Data): Promise<Campaign> => {
  const { name, message1 } = data;

  const campaignSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "ERR_CAMPAIGN_INVALID_NAME")
      .required("ERR_CAMPAIGN_REQUIRED"),
    message1: Yup.string().required("ERR_CAMPAIGN_MESSAGE_REQUIRED"),
  });

  try {
    await campaignSchema.validate({ name, message1 });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (data.scheduledAt != null && data.scheduledAt != "") {
    data.status = "PROGRAMADA";
  }

  const record = await Campaign.create(data);

  // Crear mensajes programados
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
      scheduledAt: data.scheduledAt ? new Date(new Date(data.scheduledAt).getTime() + i * 60000) : null, // Añade 1 minuto por cada mensaje
      status: "Programado"
    });
  }

  await record.reload({
    include: [
      { model: ContactList },
      { model: Whatsapp, attributes: ["id", "name"] },
      { model: Message, where: { status: "Programado" }, required: false }
    ]
  });

  return record;
};

export default CreateService;
