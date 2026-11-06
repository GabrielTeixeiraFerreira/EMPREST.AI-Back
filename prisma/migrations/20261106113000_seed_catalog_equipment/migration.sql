INSERT INTO "tenants" ("id", "slug", "name")
VALUES (gen_random_uuid(), 'suporte_ti', 'Suporte de TI')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "equipment"
    ("id", "tenant_id", "name", "category", "asset_tag", "status", "image_path", "updated_at")
SELECT gen_random_uuid(), t."id", v."nome", v."categoria"::"EquipmentCategory",
       v."patrimonio", v."situacao"::"EquipmentStatus",
       'ti-' || lower(substring(v."patrimonio" FROM 4)) || '.jpg',
       CURRENT_TIMESTAMP
FROM "tenants" AS t
CROSS JOIN (VALUES
    ('TI-0001', 'Notebook 14 polegadas', 'notebook', 'available'),
    ('TI-0002', 'Notebook 15 polegadas', 'notebook', 'available'),
    ('TI-0003', 'Notebook 13 polegadas', 'notebook', 'available'),
    ('TI-0004', 'Notebook 15 polegadas', 'notebook', 'maintenance'),
    ('TI-0005', 'Monitor 24 polegadas', 'monitor', 'available'),
    ('TI-0006', 'Monitor 27 polegadas', 'monitor', 'available'),
    ('TI-0007', 'Monitor 22 polegadas', 'monitor', 'maintenance'),
    ('TI-0008', 'Cabo HDMI 2 m', 'cable', 'available'),
    ('TI-0009', 'Cabo USB-C 1 m', 'cable', 'available'),
    ('TI-0010', 'Cabo de rede 3 m', 'cable', 'maintenance'),
    ('TI-0011', 'Webcam Full HD', 'camera', 'available'),
    ('TI-0012', 'Câmera compacta', 'camera', 'available')
) AS v("patrimonio", "nome", "categoria", "situacao")
WHERE t."slug" = 'suporte_ti'
ON CONFLICT ("tenant_id", "asset_tag") DO UPDATE SET
    "name" = EXCLUDED."name",
    "category" = EXCLUDED."category",
    "status" = EXCLUDED."status",
    "image_path" = EXCLUDED."image_path",
    "updated_at" = CURRENT_TIMESTAMP;
