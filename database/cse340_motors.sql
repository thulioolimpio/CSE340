-- 1. Remover tabelas na ordem inversa de dependência
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS classification;

-- 2. Remover o tipo ENUM se existir (agora sem dependências)
DROP TYPE IF EXISTS account_type_enum;

-- 3. Criar o tipo ENUM
CREATE TYPE account_type_enum AS ENUM ('Client', 'Admin');

-- 4. Recriar tabelas na ordem correta
CREATE TABLE classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(255) NOT NULL,
    inv_model VARCHAR(255) NOT NULL,
    inv_description TEXT NOT NULL,
    inv_image TEXT,
    inv_thumbnail TEXT,
    inv_price NUMERIC(10, 2) NOT NULL,
    inv_year INT NOT NULL,
    inv_miles INT NOT NULL,
    inv_color VARCHAR(50) NOT NULL,
    classification_id INT NOT NULL REFERENCES classification(classification_id)
);

CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(255) NOT NULL,
    account_lastname VARCHAR(255) NOT NULL,
    account_email VARCHAR(255) UNIQUE NOT NULL,
    account_password VARCHAR(255) NOT NULL,
    account_type account_type_enum DEFAULT 'Client'
);

-- 5. Popular tabelas
INSERT INTO classification (classification_name)
VALUES ('Sport'), ('SUV'), ('Truck'), ('Sedan');

INSERT INTO inventory (
    inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_year, inv_miles, inv_color, classification_id
)
VALUES
('GM', 'Hummer', 'The GM Hummer has small interiors.', '/images/hummer.jpg', '/images/hummer-thumb.jpg', 55000.00, 2020, 15000, 'Black', 1),
('Toyota', 'Supra', 'Fast and sporty car.', '/images/supra.jpg', '/images/supra-thumb.jpg', 48000.00, 2021, 8000, 'Red', 1);

-- 6. Operações adicionais
-- Inserir Tony Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Tornar Tony Stark admin
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Deletar Tony Stark
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- Atualizar descrição do Hummer
UPDATE inventory
SET inv_description = 'The GM Hummer has a huge interior.'
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Consulta JOIN
SELECT inv.inv_make, inv.inv_model, c.classification_name
FROM inventory inv
INNER JOIN classification c ON inv.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Atualizar caminhos de imagens
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'account';

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory';

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'classification';

SELECT * FROM classification;

SELECT inv_make, inv_model, inv_price FROM inventory;