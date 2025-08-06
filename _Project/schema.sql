set transaction read write;
DROP TABLE IF EXISTS Project CASCADE;
DROP TABLE IF EXISTS Issue CASCADE;
CREATE TABLE Project (
	id BIGSERIAL PRIMARY KEY,
	client_id VARCHAR ( 255 ) NOT NULL,
	title VARCHAR ( 255 ) NOT NULL,
	active boolean NOT NULL
);
CREATE TABLE Issue (
	id BIGSERIAL PRIMARY KEY,
	client_id VARCHAR ( 255 ) NOT NULL,
	project_id BIGINT NOT NULL,
	done boolean NOT NULL,
	title VARCHAR ( 255 ) NOT NULL,
	due_date date NOT NULL,
	priority VARCHAR(5) NOT NULL
);