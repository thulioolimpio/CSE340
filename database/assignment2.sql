-- 1. Inserir Tony Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Tornar Tony Stark um Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- 3. Deletar Tony Stark
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- 4. Modificar descrição do GM Hummer
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. INNER JOIN - listar veículos esportivos
SELECT inv.inv_make, inv.inv_model, c.classification_name
FROM inventory inv
INNER JOIN classification c ON inv.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Atualizar caminhos de imagem
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
