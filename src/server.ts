import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
	buildSchema,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from "graphql";
import { argsToArgsConfig } from "graphql/type/definition";
import { resolve } from "path";

// const expressGraphQL = require("express-graphql");
// const buildSchema = require("graphql");

const app = express();

interface AuthorInterface {
	id: number;
	name: string;
}

interface BookInterface {
	id: number;
	name: string;
	authorId: number;
}

interface authorWithBooksInterface extends AuthorInterface {
	books: BookInterface[];
}

const authors = [
	{ id: 1, name: "J. K. Rowling" },
	{ id: 2, name: "J. R. R. Tolkien" },
	{ id: 3, name: "Brent Weeks" },
];

const books = [
	{ id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
	{ id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
	{ id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
	{ id: 4, name: "The Fellowship of the Ring", authorId: 2 },
	{ id: 5, name: "The Two Towers", authorId: 2 },
	{ id: 6, name: "The Return of the King", authorId: 2 },
	{ id: 7, name: "The Way of Shadows", authorId: 3 },
	{ id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const AuthorType = new GraphQLObjectType({
	name: "Author",
	description: "Description of an Author",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
	}),
});

const AuthorWithBooksType = new GraphQLObjectType({
	name: "AuthorWithBooks",
	description: "Description of an Author with its books",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		// books: {type:}
		books: {
			type: GraphQLList(BookType),
			resolve: (author) => books.filter((book) => book.authorId === author.id),
		},
	}),
});

const BookType = new GraphQLObjectType({
	name: "Book",
	description: "Description of a book",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
	}),
});

const BookWithAuthorsType = new GraphQLObjectType({
	name: "BookWithAuthors",
	description: "Description of a book with its authors",
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		name: { type: GraphQLNonNull(GraphQLString) },
		authorId: { type: GraphQLNonNull(GraphQLInt) },
		author: {
			type: AuthorType,
			resolve: (book) => authors.find((author) => author.id === book.authorId),
		},
	}),
});

const RootQueryType = new GraphQLObjectType({
	name: "BookStoreQuery",
	description: "BookStore Root Query",
	fields: () => ({
		book: {
			type: BookWithAuthorsType,
			description: "Single Book by ID",
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (parent, args) => books.find((book) => book.id === args.id),
		},
		books: {
			type: GraphQLList(BookWithAuthorsType),
			description: "List of all Books",
			resolve: () => books,
		},
		author: {
			type: AuthorWithBooksType,
			description: "Single Author by ID",
			args: {
				id: {
					type: GraphQLInt,
				},
			},
			resolve: (parent, args) =>
				authors.find((author) => author.id === args.id),
		},
		authors: {
			type: GraphQLList(AuthorWithBooksType),
			description: "List of all Authors",
			resolve: () => authors,
		},
	}),
});

const RootMutationType = new GraphQLObjectType({
	name: "BookStoreMutation",
	description: "BookStore Root Mutation",
	fields: {
		addBook: {
			type: BookType,
			description: "Add a single Book",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
				authorId: { type: GraphQLNonNull(GraphQLInt) },
			},
			resolve: (parent, args) => {
				const book = {
					id: books.length + 1,
					name: args.name,
					authorId: args.authorId,
				};
				books.push(book);
				return book;
			},
		},
		updateBook: {
			type: BookWithAuthorsType,
			description: "Update a single Book",
			args: {
				id: { type: GraphQLNonNull(GraphQLInt) },
				newName: { type: GraphQLString },
				newAuthorId: { type: GraphQLInt },
			},
			resolve: (parent, args) => {
				const bookIndex = books.findIndex((book) => book.id === args.id);
				console.log("Book to update", bookIndex);

				if (bookIndex < 0 || bookIndex === null || bookIndex === undefined) {
					return;
				}

				if (args.newName) {
					books[bookIndex].name = args.newName;
				}

				if (args.newAuthorId) {
					books[bookIndex].authorId = args.newAuthorId;
				}

				return books[bookIndex];
			},
		},
		addAuthor: {
			type: AuthorType,
			description: "Add a single Author",
			args: {
				name: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve: (parent, args) => {
				const author = {
					id: authors.length + 1,
					name: args.name,
				};
				authors.push(author);
				return author;
			},
		},
		updateAuthor: {
			type: AuthorWithBooksType,
			description: "Update a single Author",
			args: {
				id: { type: GraphQLNonNull(GraphQLInt) },
				newName: { type: GraphQLString },
			},
			resolve: (parent, args) => {
				const authorIndex = authors.findIndex(
					(author) => author.id === args.id
				);
				console.log("Book to update", authorIndex);

				if (
					authorIndex < 0 ||
					authorIndex === null ||
					authorIndex === undefined
				) {
					return;
				}

				if (args.newName) {
					authors[authorIndex].name = args.newName;
				}

				return authors[authorIndex];
			},
		},
	},
});

const schema = new GraphQLSchema({
	description: "BookStore Schema",
	query: RootQueryType,
	mutation: RootMutationType,
});

app.use(
	"/graphql",
	graphqlHTTP({
		graphiql: true,
		schema: schema,
	})
);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Server Started on port ${PORT}`);
});
