import { Transaction } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import db from "../../database";

interface TaggableItem {
  id: number;
  tags: Tag[];
}

interface SyncRequest<T> {
  tags: Tag[];
  itemId: number;
  include?: any[];
}

class SyncTagsService {
  public static async syncTicketTags({
    tags,
    itemId: ticketId,
    include = [Tag]
  }: SyncRequest<Ticket>): Promise<Ticket> {
    try {
      return await this.executeSync({
        itemId: ticketId,
        tags,
        model: Ticket,
        tagModel: TicketTag,
        foreignKey: 'ticketId',
        include
      });
    } catch (error) {
      logger.error(`Error syncing ticket tags: ${error}`);
      throw new AppError('Failed to sync ticket tags', 500);
    }
  }

  public static async syncContactTags({
    tags,
    itemId: contactId,
    include = [Tag]
  }: SyncRequest<Contact>): Promise<Contact> {
    try {
      return await this.executeSync({
        itemId: contactId,
        tags,
        model: Contact,
        tagModel: ContactTag,
        foreignKey: 'contactId',
        include
      });
    } catch (error) {
      logger.error(`Error syncing contact tags: ${error}`);
      throw new AppError('Failed to sync contact tags', 500);
    }
  }

  private static async executeSync<T extends TaggableItem>({
    itemId,
    tags,
    model,
    tagModel,
    foreignKey,
    include
  }: {
    itemId: number;
    tags: Tag[];
    model: any;
    tagModel: any;
    foreignKey: string;
    include: any[];
  }): Promise<T> {
    const transaction: Transaction = await db.transaction();

    try {
      const item = await this.findItem(model, itemId, include);
      const tagList = this.prepareTagList(tags, itemId, foreignKey);

      await this.updateTags(tagModel, tagList, itemId, foreignKey, transaction);
      await item.reload({ transaction });

      await transaction.commit();
      return item;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private static async findItem<T>(
    model: any,
    itemId: number,
    include: any[]
  ): Promise<T> {
    const item = await model.findByPk(itemId, { include });
    
    if (!item) {
      throw new AppError(`${model.name} not found`, 404);
    }

    return item;
  }

  private static prepareTagList(
    tags: Tag[],
    itemId: number,
    foreignKey: string
  ): object[] {
    return tags.map(tag => ({
      tagId: tag.id,
      [foreignKey]: itemId
    }));
  }

  private static async updateTags(
    tagModel: any,
    tagList: object[],
    itemId: number,
    foreignKey: string,
    transaction: Transaction
  ): Promise<void> {
    await tagModel.destroy({
      where: { [foreignKey]: itemId },
      transaction
    });

    if (tagList.length > 0) {
      await tagModel.bulkCreate(tagList, { transaction });
    }
  }
}

export const SyncTicketTags = async (request: SyncRequest<Ticket>): Promise<Ticket> => {
  return SyncTagsService.syncTicketTags(request);
};

export const SyncContactTags = async (request: SyncRequest<Contact>): Promise<Contact> => {
  return SyncTagsService.syncContactTags(request);
};

export default {
  SyncTicketTags,
  SyncContactTags
};
