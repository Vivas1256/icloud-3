import { Op, literal, fn, col } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Contact from "../../models/Contact"; // Asegúrate de importar el modelo Contact
import { exportToCSV, exportToExcel } from "../../utils/exportUtils"; // Asegúrate de crear estas funciones de utilidad

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
  exportFormat?: 'csv' | 'xlsx';
  tagId?: number;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
  exportedData?: Buffer;
}

const ListService = async ({
  companyId,
  searchParam,
  pageNumber = "1",
  exportFormat,
  tagId
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 5000;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: tags } = await Tag.findAndCountAll({
    where: { ...whereCondition, companyId },
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    include: [{
      model: TicketTag,
      as: 'ticketTags',
      attributes: [],
      required: false
    }],
    attributes: [
      'id',
      'name',
      'color',
      [fn('count', col('ticketTags.tagId')), 'ticketsCount']
    ],
    group: ['Tag.id']
  });

  const hasMore = count > offset + tags.length;

  // Si se solicita exportación
  if (exportFormat && tagId) {
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }

    const contacts = await Contact.findAll({
      include: [{
        model: Tag,
        where: { id: tagId },
        required: true
      }],
      where: { companyId }
    });

    const exportData = contacts.map(contact => ({
      Name: contact.name,
      Number: contact.number,
      Email: contact.email
    }));

    let exportedData;
    if (exportFormat === 'csv') {
      exportedData = exportToCSV(exportData);
    } else if (exportFormat === 'xlsx') {
      exportedData = exportToExcel(exportData);
    }

    return {
      tags,
      count,
      hasMore,
      exportedData
    };
  }

  return {
    tags,
    count,
    hasMore
  };
};

export default ListService;
