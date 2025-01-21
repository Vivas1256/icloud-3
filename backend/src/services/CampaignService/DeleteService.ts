import { Op } from "sequelize";
import Campaign from "../../models/Campaign";
import Message from "../../models/Message";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

const DeleteService = async (id: string): Promise<void> => {
  try {
    const record = await Campaign.findOne({
      where: { id },
      include: [
        {
          model: Message,
          where: { status: { [Op.ne]: "ENVIADO" } },
          required: false
        }
      ]
    });

    if (!record) {
      throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
    }

    if (record.status === "Proceso") {
      throw new AppError("ERR_DELETE_RUNNING_CAMPAIGN", 400);
    }

    // Check if there are any scheduled messages
    if (record.Messages && record.Messages.length > 0) {
      // Delete associated messages
      await Message.destroy({ where: { campaignId: id } });
    }

    await record.destroy();
    logger.info(`Campaign deleted successfully: ${id}`);
  } catch (error) {
    logger.error(`Error deleting campaign ${id}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_DELETE_CAMPAIGN", 500);
  }
};

export default DeleteService;
