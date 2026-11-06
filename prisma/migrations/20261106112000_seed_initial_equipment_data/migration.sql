UPDATE "equipment" AS e
SET
    "status" = CASE
        WHEN e."asset_tag" IN ('TI-0004', 'TI-0007', 'TI-0010')
            THEN 'maintenance'::"EquipmentStatus"
        ELSE 'available'::"EquipmentStatus"
    END,
    "image_path" = 'ti-' || lower(substring(e."asset_tag" FROM 4)) || '.jpg'
FROM "tenants" AS t
WHERE e."tenant_id" = t."id"
  AND t."slug" = 'suporte_ti'
  AND e."asset_tag" IN (
      'TI-0001', 'TI-0002', 'TI-0003', 'TI-0004',
      'TI-0005', 'TI-0006', 'TI-0007', 'TI-0008',
      'TI-0009', 'TI-0010', 'TI-0011', 'TI-0012'
  );
