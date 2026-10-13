import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

type Row = {
	user_id: string;
	name: string;
	created_at: Date;
	date: string | null;
	count: number;
	tagged: number;
};

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	// TODO: admin check goes here (requireAuth only proves a user is logged in, not that they're admin)

	if (this.config.ENVIRONMENT !== 'local')
		return reply.code(200).send({});
	
	const rows = await this.prisma.$queryRaw<Row[]>`
			SELECT
				u.id AS user_id,
				u.name,
				u.created_at,
				to_char((t.transaction_date AT TIME ZONE u.timezone)::date, 'YYYY-MM-DD') AS date,
				COUNT(t.id)::int AS count,
				COUNT(t.tag_id)::int AS tagged
			FROM "User" u
			LEFT JOIN "Transaction" t ON t.user_id = u.id
			GROUP BY 1, 2, 3, 4
			ORDER BY u.created_at ASC, date DESC
		`;
	
		const users = new Map<string, {
			id: string;
			name: string;
			created_at: Date;
			total_transactions: number;
			total_tags: number;
			days: { date: string; count: number; tagged: number }[];
		}>();
	
		for (const r of rows) {
			if (!users.has(r.user_id)) {
				users.set(r.user_id, {
					id: r.user_id,
					name: r.name,
					created_at: r.created_at,
					total_transactions: 0,
					total_tags: 0,
					days: []
				});
			}
	
			// users with no transactions come back with date = null
			if (r.date) {
				const u = users.get(r.user_id)!;
				u.days.push({ date: r.date, count: r.count, tagged: r.tagged });
				u.total_transactions += r.count;
				u.total_tags += r.tagged;
			}
		}
	
		return reply.code(200).send({
			total_users: users.size,
			users: [...users.values()]
		});
}

export const get_stats = { handler };