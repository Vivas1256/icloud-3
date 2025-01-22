import { Op } from "sequelize";
import Campaign from "../../models/Campaign";
import Message from "../../models/Message";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

const DeleteService = async (id: string): Promise<void> => {
  const transaction = await Campaign.sequelize.transaction();

  try {
    const record = await Campaign.findOne({
      where: { id },
      transaction
    });

    if (!record) {
      throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
    }

    // Delete associated messages that are not sent
    await Message.destroy({ 
      where: { 
        campaignId: id, 
        status: { [Op.ne]: "ENVIADO" } 
      },
      transaction 
    });

    // Delete the campaign
    await record.destroy({ transaction });

    await transaction.commit();
    logger.info(`Campaign deleted successfully: ${id}`);
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error deleting campaign ${id}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("ERR_DELETE_CAMPAIGN", 500);
  }
};

export default DeleteService;
