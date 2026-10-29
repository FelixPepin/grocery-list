-- =====================================================
-- Grocery list database
-- Executed automatically by the MySQL container on first start
-- (only when the mysql_data volume is empty).
-- The database itself is created by MYSQL_DATABASE in docker-compose.yml.
-- =====================================================

SET NAMES utf8mb4;

-- =====================================================
-- TABLE grocery_items
-- =====================================================

CREATE TABLE IF NOT EXISTS grocery_items (
    id          INT           NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)  NOT NULL,
    quantity    INT           NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    -- Last line of defense: the API validates first, the database guarantees it
    CONSTRAINT chk_name_not_empty   CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_quantity_min     CHECK (quantity >= 1),
    CONSTRAINT chk_unit_price_min   CHECK (unit_price > 0)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample data (so the list is not empty on first launch)
-- =====================================================

INSERT INTO grocery_items (name, quantity, unit_price) VALUES
    ('Apple', 6, 0.75),
    ('Milk 2L', 1, 5.49),
    ('Bread', 2, 3.99),
    ('Coffee', 1, 12.99);