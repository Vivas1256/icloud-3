import { Op } from "sequelize";
import CampaignSetting from "../../models/CampaignSetting";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number | string;
  searchParam?: string;
  pageNumber?: string;
  pageSize?: string;
}

interface Response {
  records: CampaignSetting[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1",
  pageSize = "20"
}: Request): Promise<Response> => {
  const whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition[Op.or] = [
      { key: { [Op.like]: `%${searchParam}%` } },
      { value: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  const limit = parseInt(pageSize, 10);
  const offset = (parseInt(pageNumber, 10) - 1) * limit;

  try {
    const { count, rows: records } = await CampaignSetting.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const hasMore = count > offset + records.length;

    return {
      records,
      count,
      hasMore
    };
  } catch (error) {
    throw new AppError(`Error fetching campaign settings: ${error.message}`, 500);
  }
};

export default ListService;
