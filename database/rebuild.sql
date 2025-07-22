-- CRIAÇÃO DO ENUM
DROP TYPE IF EXISTS account_type_enum;
CREATE TYPE account_type_enum AS ENUM ('Client', 'Admin');

-- CRIAÇÃO DAS TABELAS
DROP TABLE IF EXISTS account, inventory, classification;

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
    inv_price NUMERIC(10, 2),
    inv_year INT,
    inv_miles INT,
    inv_color VARCHAR(50),
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

-- POPULAR classification
INSERT INTO classification (classification_name)
VALUES ('Sport'), ('SUV'), ('Truck'), ('Sedan');

-- POPULAR inventory com 2 veículos da categoria 'Sport'
INSERT INTO inventory (
    inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_year, inv_miles, inv_color, classification_id
)
VALUES
-- CORRIGIDO: GM Hummer com classification_id = 1 (Sport)
('GM', 'Hummer', 'The GM Hummer has small interiors.', '/images/hummer.jpg', '/images/hummer-thumb.jpg', 55000.00, 2020, 15000, 'Black', 1),
('Toyota', 'Supra', 'Fast and sporty car.', '/images/supra.jpg', '/images/supra-thumb.jpg', 48000.00, 2021, 8000, 'Red', 1);

-- QUERY 4 - Atualizar descrição do GM Hummer
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- QUERY 6 - Atualizar caminhos de imagem
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');




