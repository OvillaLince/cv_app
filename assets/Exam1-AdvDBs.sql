-- Database: exam1
/*Script for Exam 1 Advanced Databases*/
/*CREATE TABLE exam1*/

/*FIRST PART OF THE EXAM*/
CREATE SCHEMA IF NOT EXISTS pr_library;
CREATE TABLE pr_library.publishers(
	name VARCHAR(50) PRIMARY KEY,
	address VARCHAR(100), 
	country VARCHAR(40) NOT NULL,
	ceo VARCHAR(50),
	UNIQUE (address, country)
);
CREATE TABLE pr_library.authors(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL, 
	country VARCHAR(40),
	age INTEGER
);
CREATE TABLE pr_library.books(
	isbn VARCHAR(17) PRIMARY KEY,
	title VARCHAR(75) UNIQUE NOT NULL,
	price NUMERIC(8,2),
	release_year INTEGER,
	publisher_name VARCHAR(50) REFERENCES pr_library.publishers(name) ON UPDATE CASCADE
);
CREATE TABLE pr_library.author_books(
	book_isbn VARCHAR(17) REFERENCES pr_library.books(isbn) ON UPDATE CASCADE,
	author_id INTEGER REFERENCES pr_library.authors(id),
	PRIMARY KEY (book_isbn, author_id)
);
CREATE TABLE pr_library.authors_with_agents(
	author_id INTEGER REFERENCES pr_library.authors(id),
	name VARCHAR(50) NOT NULL
);

INSERT INTO pr_library.publishers 
	(name, address, country, ceo )
VALUES
	('Scifi Inks', '123 E Main Street, Louisville', 'United States', 'Octavio Ricardo'),
	('Soccer Tree', '123 E Main Street, Louisville', 'India', 'Nathan Ryan'),
	('Lakerits', '508 West street, Los Santos', 'Panama', 'Luis Alejandro'),
	('Bandido Denting', 'Calle 7, Panama City', 'Panama', 'Rene Tejada'),
	('Fortnighters', 'NW 74th Ave, Miami', 'United States', 'Angel Paulo'),
	('Arepa Complex', '','Venezuela', 'Jorge Martinez');

INSERT INTO pr_library.books
	(isbn, title, price, release_year, publisher_name )
VALUES
	('242-2-5251-7321-0', 'Temporal Encounters: A Science Fiction Odyssey', 53.42, 1994, 'Scifi Inks'),
	('132-7-6263-1427-1', 'Spectral Passages: Exploring Otherworldly Portals', 33.99, 2000, 'Scifi Inks'),
	('315-1-6124-1623-0', 'Kickoff Chronicles: Barcelona vs. Chelsea', 23.99, 1998, 'Soccer Tree'),
	('020-4-0129-8585-1', 'Quest for Glory: Clippers in Pursuit of the Championship', 52.99, 2025, 'Soccer Tree'),
	('231-0-2315-1262-0', 'Shattered Legacy: The Scandalous History of the LA Lakers', 999.99, 2022, 'Lakerits'),
	('441-9-0014-3851-1', 'Nightmare Road: The Reign of Mario Kart Defeat', 0.0, 2024, 'Lakerits'),
	('761-7-2731-2723-0', 'In the Shadow of Secrets: Unmasking Womens Lies', 69.69, 2005, 'Bandido Denting'),
	('141-4-3431-6663-1', 'Romancing the Streets of Los Santos', 11.99, 2002, 'Bandido Denting'),
	('613-6-3613-3613-0', 'Unleashing Your Fortnite Potential: A Practical Guide', 250.00, 2020, 'Fortnighters'),
	('253-5-3413-6321-1', 'Fortnite Triumph: Leveling Up Your Skills and Strategy', 51.25, 2019, 'Fortnighters'),
	('593-3-3351-1916-0', 'The Maduro Conspiracy', 2.52, 2020, 'Arepa Complex');

INSERT INTO pr_library.authors
	(name, country, age)
VALUES
	('Jorge Martinez', 'Venezuela', 27),
	('Rene Tejada', 'Panama', 29),
	('William Blaese', 'United States', 21),
	('Martin Morris','Canada', 22),
	('Octavio Ricardo', 'United States', 29),
	('Luis Alejandro', 'Panama', 26),
	('Nathan Ryan', 'India', 26);
INSERT INTO pr_library.authors_with_agents
	(author_id, name)
VALUES
	(5, 'Silas Hughes'),
	(3, 'Oscar Andrews');
INSERT INTO pr_library.author_books
	(book_isbn, author_id)
VALUES
	('441-9-0014-3851-1', 5),
	('441-9-0014-3851-1', 6),
	('441-9-0014-3851-1', 7),
	('141-4-3431-6663-1', 2),
	('761-7-2731-2723-0', 2),
	('253-5-3413-6321-1', 2),
	('253-5-3413-6321-1', 1),
	('613-6-3613-3613-0', 3),
	('593-3-3351-1916-0', 3),
	('231-0-2315-1262-0', 4),
	('132-7-6263-1427-1', 4),
	('315-1-6124-1623-0', 5),
	('020-4-0129-8585-1', 7),
	('242-2-5251-7321-0', 5);

CREATE SCHEMA IF NOT EXISTS er_library;
CREATE TYPE er_library.author AS (
	name VARCHAR(50), 
	country VARCHAR(40),
	age INTEGER,
	agent_name VARCHAR(50)
);
CREATE TYPE er_library.publisher AS (
	name VARCHAR(50),
	address VARCHAR(100),
	country VARCHAR(40),
	ceo VARCHAR(50)
	
);
CREATE TYPE er_library.book AS (
	isbn VARCHAR(17),
	title VARCHAR(75),
	price NUMERIC(8,2),
	release_year INTEGER,
	publisher er_library.publisher,
	authors er_library.author[]
);
CREATE TABLE er_library.books of er_library.book;
INSERT INTO er_library.books
	(isbn, title, price, release_year, publisher, authors)
VALUES
	('242-2-5251-7321-0', 'Temporal Encounters: A Science Fiction Odyssey', 53.42, 1994, 
		('Scifi Inks', '123 E Main Street, Louisville', 'United States', 'Octavio Ricardo')::er_library.publisher,
		ARRAY[
			ROW('Octavio Ricardo', 'United States', 29, 'Silas Hughes')::er_library.author
		
		]
	),
	('132-7-6263-1427-1', 'Spectral Passages: Exploring Otherworldly Portals', 33.99, 2000, 
		('Scifi Inks', '123 E Main Street, Louisville', 'United States', 'Octavio Ricardo')::er_library.publisher,
		ARRAY[
			ROW('Martin Morris','Canada', 22, null)::er_library.author
		
		]
	),
	('315-1-6124-1623-0', 'Kickoff Chronicles: Barcelona vs. Chelsea', 23.99, 1998, 
		('Soccer Tree', '123 E Main Street, Louisville', 'India', 'Nathan Ryan')::er_library.publisher,
		ARRAY[
			ROW('Octavio Ricardo', 'United States', 29, 'Silas Hughes')::er_library.author
		
		]
	),
	('020-4-0129-8585-1', 'Quest for Glory: Clippers in Pursuit of the Championship', 52.99, 2025, 
		('Soccer Tree', '123 E Main Street, Louisville', 'India', 'Nathan Ryan')::er_library.publisher,
		ARRAY[
			ROW('Nathan Ryan', 'India', 26, null)::er_library.author
		
		]
	),
	('231-0-2315-1262-0', 'Shattered Legacy: The Scandalous History of the LA Lakers', 999.99, 2022, 
		('Lakerits', '508 West street, Los Santos', 'Panama', 'Luis Alejandro')::er_library.publisher,
		ARRAY[
			ROW('Martin Morris','Canada', 22, null)::er_library.author
		
		]
	),
	('441-9-0014-3851-1', 'Nightmare Road: The Reign of Mario Kart Defeat', 0.0, 2024, 
		('Lakerits', '508 West street, Los Santos', 'Panama', 'Luis Alejandro')::er_library.publisher,
		ARRAY[
			ROW('Octavio Ricardo', 'United States', 29, 'Silas Hughes')::er_library.author,
			ROW('Luis Alejandro', 'Panama', 26, null)::er_library.author,
			ROW('Nathan Ryan', 'India', 26, null)::er_library.author
		]
	),
	('761-7-2731-2723-0', 'In the Shadow of Secrets: Unmasking Womens Lies', 69.69, 2005, 
		('Bandido Denting', 'Calle 7, Panama City', 'Panama', 'Rene Tejada')::er_library.publisher,
		ARRAY[
			ROW('Rene Tejada', 'Panama', 29, null)::er_library.author
		]
	),
	('141-4-3431-6663-1', 'Romancing the Streets of Los Santos', 11.99, 2002, 
		('Bandido Denting', 'Calle 7, Panama City', 'Panama', 'Rene Tejada')::er_library.publisher,
		ARRAY[
			ROW('Rene Tejada', 'Panama', 29, null)::er_library.author
		]
	),
	('613-6-3613-3613-0', 'Unleashing Your Fortnite Potential: A Practical Guide', 250.00, 2020, 
		('Fortnighters', 'NW 74th Ave, Miami', 'United States', 'Angel Paulo')::er_library.publisher,
		ARRAY[
			ROW('William Blaese', 'United States', 21, 'Oscar Andrews')::er_library.author
		]
	),
	('253-5-3413-6321-1', 'Fortnite Triumph: Leveling Up Your Skills and Strategy', 51.25, 2019, 
		('Fortnighters', 'NW 74th Ave, Miami', 'United States', 'Angel Paulo')::er_library.publisher,
		ARRAY[
			ROW('Jorge Martinez', 'Venezuela', 27, null)::er_library.author,
			ROW('Rene Tejada', 'Panama', 29, null)::er_library.author
		]
	),
	('593-3-3351-1916-0', 'The Maduro Conspiracy', 2.52, 2020, 
		('Arepa Complex', '','Venezuela', 'Jorge Martinez')::er_library.publisher,
		ARRAY[
			ROW('William Blaese', 'United States', 21, 'Oscar Andrews')::er_library.author
		]
	);
/*JSON DATABASE*/
CREATE SCHEMA IF NOT EXISTS json_library;
CREATE TABLE json_library.books(jsonb_data jsonb);

/*INSERTING DATA FROM EXTENDED RELATIONAL DATABASE WITH A QUERY FOR EXTRA POINTS*/
INSERT INTO json_library.books(jsonb_data)
SELECT row_to_json(library)::jsonb
FROM(
	SELECT isbn AS isbn, title AS title, price AS price, release_year AS realease_year, 
		jsonb_build_object('name', (books.publisher).name, 'address', (books.publisher).address, 'country', (books.publisher).country, 'ceo', (books.publisher).ceo) AS publisher,
		array_to_json(books.authors) AS authors
	FROM er_library.books
) AS library;

/* SECOND PART OF THE EXAM*/

/*QUERIES FOR THE PLAIN RELATIONAL DATABASE*/
/*a*/
SELECT authors.name, authors_with_agents.name, ROUND(AVG(books.price),2 )  AS avg_price
FROM pr_library.authors
LEFT JOIN pr_library.author_books ON authors.id = author_books.author_id
LEFT JOIN pr_library.books ON author_books.book_isbn = books.isbn
LEFT JOIN pr_library.authors_With_agents ON authors.id = authors_with_agents.author_id
GROUP BY (authors.name, authors_with_agents.name);
/*b*/
SELECT books.title, COUNT(CASE WHEN authors.age < 25 THEN 1 END)
FROM pr_library.books
LEFT JOIN pr_library.author_books ON books.isbn = author_books.book_isbn
LEFT JOIN pr_library.authors ON author_books.author_id = authors.id
GROUP BY(books.title);
/*c*/
SELECT publishers.name, array_agg(books.title) AS titles
FROM pr_library.publishers
LEFT JOIN pr_library.books ON publishers.name = books.publisher_name
WHERE books.release_year = 2015
GROUP BY(publishers.name);
/*d*/
SELECT DISTINCT (a1.name, a2.name) AS author_pairs
FROM pr_library.author_books ab1
JOIN pr_library.author_books ab2 ON ab1.book_isbn = ab2.book_isbn
JOIN pr_library.authors a1 ON ab1.author_id = a1.id
JOIN pr_library.authors a2 ON ab2.author_id = a2.id
WHERE a1.id < a2.id
ORDER BY author_pairs;

/*QUERIES FOR THE EXTENDED RELATIONAL DATABASE*/
/*a*/
SELECT authors.name, authors.agent_name, ROUND(AVG(books.price),2) AS avg_price
FROM er_library.books AS books, UNNEST(authors) AS authors
GROUP BY authors.name, authors.agent_name;
/*b*/
SELECT books.title, COUNT(CASE WHEN authors.age < 25 THEN 1 END)
FROM er_library.books, UNNEST(authors) as authors
GROUP BY books.title;
/*c*/
SELECT (books.publisher).name, array_agg(books.title)
FROM er_library.books
WHERE books.release_year = 2020
GROUP BY((books.publisher).name);
/*d*/
SELECT DISTINCT (a1.name, a2.name) AS author_pairs
FROM 
    (SELECT isbn, (UNNEST(authors)::er_library.author).name 
    FROM er_library.books) AS a1 
CROSS JOIN
    (SELECT isbn, (UNNEST(authors)::er_library.author).name 
    FROM er_library.books) AS a2
WHERE a1.isbn = a2.isbn AND a1.name < a2.name
ORDER BY author_pairs;

/*QUERIES FOR THE JSON DATABASE*/
/*a*/
SELECT author_info->>'name' AS a_name, author_info->>'agent_name' AS agent_name, ROUND(AVG((book->>'price')::numeric),2) AS avg_price
FROM
    (SELECT jsonb_data->'authors' AS authors, jsonb_data AS book
     FROM json_library.books
    ) AS book_data
CROSS JOIN LATERAL jsonb_array_elements(book_data.authors) AS author_info
GROUP BY author_info->>'name', author_info->>'agent_name';
/*b*/
SELECT
    jsonb_data->>'title' AS title,
    COUNT(CASE WHEN (author->>'age')::int < 25 THEN 1 END)
FROM
    (
        SELECT
            jsonb_data,
            jsonb_array_elements(jsonb_data->'authors') AS author
        FROM
            json_library.books
    ) AS book_authors
GROUP BY
    jsonb_data->>'title';

/* MISSING LAST 2 QUERIES */

/*c*/


/*d*/
SELECT DISTINCT (a1->>'name', a2->>'name') AS author_pairs
FROM json_library.books b1
JOIN json_library.books b2 ON b1.jsonb_data->'publisher'->>'name' = b2.jsonb_data->'publisher'->>'name' 
	AND b1.jsonb_data->>'isbn' = b2.jsonb_data->>'isbn'
JOIN LATERAL jsonb_array_elements(b1.jsonb_data->'authors') a1 ON true
JOIN LATERAL jsonb_array_elements(b2.jsonb_data->'authors') a2 ON true
WHERE a1->>'name' < a2->>'name';




