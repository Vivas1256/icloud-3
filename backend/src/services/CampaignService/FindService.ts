import { Op } from 'sequelize';
import Campaign from "../../models/Campaign";
import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";
import ContactList from "../../models/ContactList";

interface FindServiceParams {
  companyId: string;
  searchParam?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface FindServiceResult {
  campaigns: Campaign[];
  count: number;
  hasMore: boolean;
}

const FindService = async ({
  companyId,
  searchParam = '',
  status,
  pageNumber = 1,
  pageSize = 20
}: FindServiceParams): Promise<FindServiceResult> => {
  const whereCondition: any = {
    companyId
  };

  if (status) {
    whereCondition.status = status;
  }

  if (searchParam) {
    whereCondition.name = { [Op.like]: `%${searchParam}%` };
  }

  const { count, rows: campaigns } = await Campaign.findAndCountAll({
    where: whereCondition,
    include: [
      { 
        model: Company, 
        as: "company", 
        attributes: ["id", "name"] 
      },
      { 
        model: Whatsapp, 
        attributes: ["id", "name"] 
      },
      { 
        model: ContactList, 
        attributes: ["id", "name"] 
      }
    ],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize
  });

  const hasMore = count > pageNumber * pageSize;

  return {
    campaigns,
    count,
    hasMore
  };
};

export default FindService;
