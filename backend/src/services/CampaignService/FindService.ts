import { Op } from 'sequelize';
import Campaign from "../../models/Campaign";
import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";
import ContactList from "../../models/ContactList";

export interface FindServiceParams {
  companyId: string | number;
  searchParam?: string;
  status?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
}

export interface FindServiceResult {
  records: Campaign[];
  count: number;
  hasMore: boolean;
}

export const FindService = async ({
  companyId,
  searchParam = '',
  status,
  pageNumber = '1',
  pageSize = '20'
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

  const limit = parseInt(pageSize.toString(), 10);
  const offset = (parseInt(pageNumber.toString(), 10) - 1) * limit;

  const { count, rows: records } = await Campaign.findAndCountAll({
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
    limit,
    offset
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};