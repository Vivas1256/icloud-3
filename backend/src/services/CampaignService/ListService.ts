import { Op, fn, col, where } from "sequelize";
import Campaign from "../../models/Campaign";
import { isEmpty } from "lodash";
import ContactList from "../../models/ContactList";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number | string;
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  pageSize?: string;
}

interface Response {
  records: Campaign[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  pageSize = "20",
  companyId,
  status
}: Request): Promise<Response> => {
  let whereCondition: any = {
    companyId
  };

  if (status) {
    whereCondition.status = status;
  }

  if (!isEmpty(searchParam)) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: where(
            fn("LOWER", col("Campaign.name")),
            "LIKE",
            `%${searchParam.toLowerCase().trim()}%`
          )
        }
      ]
    };
  }

  const limit = parseInt(pageSize, 10);
  const offset = limit * (parseInt(pageNumber, 10) - 1);

  const { count, rows: records } = await Campaign.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: ContactList, attributes: ["id", "name"] },
      { model: Whatsapp, attributes: ["id", "name"] }
    ]
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;
