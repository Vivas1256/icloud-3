import { Op } from "sequelize";
import Campaign from "../../models/Campaign";
import Message from "../../models/Message";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

const DeleteService = async (id) => {
  const transaction = await Campaign.sequelize.transaction();

  try {
    const campaign = await Campaign.findByPk(id, { transaction });

    if (!campaign) {
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
    await campaign.destroy({ transaction });

    await transaction.commit();
    logger.info(`Campaign deleted successfully: ${id}`);
  } catch (err) {
    await transaction.rollback();
    logger.error(`Error deleting campaign ${id}:`, err);
    throw new AppError("ERR_DELETE_CAMPAIGN", 500);
  }
};

export default DeleteService;
