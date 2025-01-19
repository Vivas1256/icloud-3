import { Op } from 'sequelize';
import Campaign from "../../models/Campaign";
import Whatsapp from "../../models/Whatsapp";
import ContactList from "../../models/ContactList";

interface FindAllServiceParams {
  companyId?: number;
  searchParam?: string;
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}

const FindAllService = async ({
  companyId,
  searchParam = '',
  pageNumber = 1,
  pageSize = 20,
  status
}: FindAllServiceParams): Promise<{ records: Campaign[]; count: number; hasMore: boolean }> => {
  const whereCondition: any = {};
  
  if (companyId) {
    whereCondition.companyId = companyId;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (searchParam) {
    whereCondition.name = { [Op.like]: `%${searchParam}%` };
  }

  const { count, rows: records } = await Campaign.findAndCountAll({
    where: whereCondition,
    include: [
      { model: Whatsapp, attributes: ["id", "name"] },
      { model: ContactList, attributes: ["id", "name"] }
    ],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize
  });

  const hasMore = count > pageNumber * pageSize;

  return {
    records,
    count,
    hasMore
  };
};

export default FindAllService;