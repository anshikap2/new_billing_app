import connectionPool from "../config/databaseConfig.js";

// Create tables queries
const createPurchaseTableQuery = `
CREATE TABLE IF NOT EXISTS purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id VARCHAR(255) NOT NULL UNIQUE,
    expenses_number VARCHAR(255) NOT NULL UNIQUE,
    supplier_name VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Pending',
    items_count INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const createPurchaseItemsTableQuery = `
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

// CRUD Operations
const createPurchase = async (data) => {
  const {
    purchase_id, expenses_number, supplier_name,
    purchase_date, due_date, total_amount,
    payment_status, items_count, notes, items
  } = data;

  const purchaseSQL = `
    INSERT INTO purchases (purchase_id, expenses_number, supplier_name, 
    purchase_date, due_date, total_amount, payment_status, items_count, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connectionPool.execute(purchaseSQL, [
    purchase_id, expenses_number, supplier_name,
    purchase_date, due_date, total_amount,
    payment_status, items_count, notes
  ]);

  // Insert items if present
  if (items && items.length > 0) {
    const itemSQL = `
      INSERT INTO purchase_items (purchase_id, item_name, quantity, price, total)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connectionPool.execute(itemSQL, [
        purchase_id, item.item_name, item.quantity,
        item.price, item.total
      ]);
    }
  }

  return result.insertId;
};

const getAllPurchases = async () => {
  const [rows] = await connectionPool.execute("SELECT * FROM purchases");
  return rows;
};

const getPurchaseById = async (id) => {
  const [purchase] = await connectionPool.execute(
    "SELECT * FROM purchases WHERE purchase_id = ?",
    [id]
  );
  
  if (purchase.length > 0) {
    const [items] = await connectionPool.execute(
      "SELECT * FROM purchase_items WHERE purchase_id = ?",
      [id]
    );
    purchase[0].items = items;
  }
  
  return purchase[0];
};

const updatePurchase = async (id, data) => {
  const {
    expenses_number, supplier_name, purchase_date,
    due_date, total_amount, payment_status,
    items_count, notes, items
  } = data;

  const sql = `
    UPDATE purchases 
    SET expenses_number=?, supplier_name=?, purchase_date=?,
        due_date=?, total_amount=?, payment_status=?,
        items_count=?, notes=?
    WHERE purchase_id=?
  `;

  await connectionPool.execute(sql, [
    expenses_number, supplier_name, purchase_date,
    due_date, total_amount, payment_status,
    items_count, notes, id
  ]);

  // Update items if present
  if (items && items.length > 0) {
    // Delete existing items
    await connectionPool.execute(
      "DELETE FROM purchase_items WHERE purchase_id = ?",
      [id]
    );

    // Insert new items
    const itemSQL = `
      INSERT INTO purchase_items (purchase_id, item_name, quantity, price, total)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connectionPool.execute(itemSQL, [
        id, item.item_name, item.quantity,
        item.price, item.total
      ]);
    }
  }
};

const deletePurchase = async (id) => {
  await connectionPool.execute(
    "DELETE FROM purchases WHERE purchase_id = ?",
    [id]
  );
};

const initializeTables = async () => {
  try {
    await connectionPool.execute(createPurchaseTableQuery);
    await connectionPool.execute(createPurchaseItemsTableQuery);
    console.log('Purchase tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Initialize connection and export functions
export {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  initializeTables
};
