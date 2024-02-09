/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { createYoga } from 'graphql-yoga';
import SchemaBuilder from '@pothos/core';

export interface Env {
	DEFAULT_NAME: string;
}

// ビルダーに環境変数を渡してあげる。
const builder = new SchemaBuilder<{ Context: Env }>({});

const Node = builder.interfaceRef('Node').implement({
	fields: (t) => ({
		id: t.id(),
	}),
});

interface UserShape {
	id: string;
	name: string;
}
const User = builder.objectRef<UserShape>('User').implement({
	interfaces: [Node],
	fields: (t) => ({
		id: t.exposeID('id'),
		name: t.exposeString('name'),
	}),
	isTypeOf: (v) => (typeof v === 'object' && v && 'id' in v && typeof v.id === 'string' && v.id.startsWith('User:')) || false,
});

builder.queryType({
	fields: (t) => ({
		node: t.field({
			type: Node,
			args: {
				id: t.arg({
					type: 'ID',
					required: true,
				}),
			},
			resolve: (parent, args, ctx) => {
				return {
					id: args.id,
					name: 'Hey',
				};
			},
		}),
		user: t.field({
			type: User,
			args: {
				id: t.arg({
					type: 'String',
					description: 'ユーザーID',
					required: true,
				}),
			},
			resolve: (parent, args, ctx) => {
				return {
					id: args.id,
					name: ctx.DEFAULT_NAME, // 環境変数を参照できることを確認。
					//contact: { email: 'peter@example.com' },
				};
			},
		}),
	}),
});

const gql = createYoga({
	schema: builder.toSchema(),
});

export default {
	fetch: gql.fetch,
};
