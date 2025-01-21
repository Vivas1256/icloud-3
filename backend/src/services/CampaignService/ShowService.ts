import { Op } from "sequelize";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<Campaign> => {
  try {
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

    console.log(`Campaign retrieved successfully: ${id}`);
    return record;
  } catch (error) {
    console.error(`Error fetching campaign with id ${id}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_CAMPAIGN_FETCH", 500);
  }
};

export default ShowService;
