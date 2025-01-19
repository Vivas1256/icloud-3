import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import CampaignShipping from "../../models/CampaignShipping";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message"; // Asegúrate de importar el modelo de Message

const ShowService = async (id: string | number): Promise<Campaign> => {
  const record = await Campaign.findByPk(id, {
    include: [
      { model: CampaignShipping },
      { model: ContactList, include: [{ model: ContactListItem }] },
      { model: Whatsapp, attributes: ["id", "name"] },
      { 
        model: Message, 
        where: { status: "SCHEDULED" }, 
        required: false,
        order: [["scheduledAt", "ASC"]]
      }
    ]
  });

  if (!record) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  return record;
};

export default ShowService;
