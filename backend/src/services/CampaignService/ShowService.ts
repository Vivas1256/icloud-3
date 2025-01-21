import { logger } from "../utils/logger";
import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import CampaignShipping from "../../models/CampaignShipping";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";

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

    return record;
  } catch (error) {
    logger.error(`Error fetching campaign with id ${id}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_CAMPAIGN_FETCH", 500);
  }
};

export default ShowService;
