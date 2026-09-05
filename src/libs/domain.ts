import { Prisma, PrismaClient } from "#/prisma/client.js";

class Domain {
	static async enableOrCreateCategory(prisma: PrismaClient | Prisma.TransactionClient, user_id: string, category_name: string) {
    const trimmed = category_name.trim();
    const lowercase_name = trimmed.toLowerCase();
    
    const category = await prisma.category.upsert({
      where: { user_id_lowercase_name: { user_id, lowercase_name } },
      update: { is_active: true },
      create: { user_id, name: trimmed, lowercase_name },
    });
    return category.id;
  }

  static async enableOrCreateCounterparty(prisma: PrismaClient | Prisma.TransactionClient, user_id: string, counterparty_name: string) {
     const trimmed = counterparty_name.trim();
     const lowercase_name = trimmed.toLowerCase();
     
     const counterparty = await prisma.counterparty.upsert({
       where: { user_id_lowercase_name: { user_id, lowercase_name } },
       update: { is_active: true },
       create: { user_id, name: trimmed, lowercase_name },
     });
     return counterparty.id;
   }
}

export default Domain;