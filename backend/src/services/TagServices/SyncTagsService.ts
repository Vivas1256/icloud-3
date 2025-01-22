import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag"; // Asegúrate de que este modelo exista

interface TicketRequest {
  tags: Tag[];
  ticketId: number;
}

interface ContactRequest {
  tags: Tag[];
  contactId: number;
}

export const SyncTicketTags = async ({
  tags,
  ticketId
}: TicketRequest): Promise<Ticket | null> => {
  const ticket = await Ticket.findByPk(ticketId, { include: [Tag] });

  const tagList = tags.map(t => ({ tagId: t.id, ticketId }));

  await TicketTag.destroy({ where: { ticketId } });
  await TicketTag.bulkCreate(tagList);

  await ticket?.reload();

  return ticket;
};

export const SyncContactTags = async ({
  tags,
  contactId
}: ContactRequest): Promise<Contact | null> => {
  const contact = await Contact.findByPk(contactId, { include: [Tag] });

  if (!contact) {
    throw new Error("Contact not found");
  }

  const tagList = tags.map(t => ({ tagId: t.id, contactId }));

  await ContactTag.destroy({ where: { contactId } });
  await ContactTag.bulkCreate(tagList);

  await contact.reload();

  return contact;
};

export default {
  SyncTicketTags,
  SyncContactTags
};
