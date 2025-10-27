const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:19006', 'exp://192.168.1.213:19000'],
  credentials: true
}));
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "testtt",
  password: "admin",
  port: 5432,
});

// Test de connexion à la base
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ==================== ROUTES API ====================

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route pour l'utilisateur courant
app.get('/api/user/current', async (req, res) => {
  try {
    console.log('Fetching current user...');
    
    const query = 'SELECT id_user, nom, email, role FROM users ';
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('Current user found:', user);
      res.json(user);
    } else {
      // Utilisateur par défaut si la table est vide
      
      res.json("defaultUser");
    }
  } catch (error) {
    console.error('Error in /api/user/current:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Route pour le solde
app.get('/api/balance', async (req, res) => {
  try {
    console.log('Fetching balance data...');
    // le solde de derinier mois trouve dans base de donne
    const query = `
      SELECT 
    TO_CHAR(m.date_mouvement, 'YYYY-MM') AS mois,
    SUM(CASE WHEN m.type_mouvement = 'entree' THEN m.quantite * m.prix_unitaire ELSE 0 END) AS total_income,
    SUM(CASE WHEN m.type_mouvement = 'sortie' THEN m.quantite * m.prix_unitaire ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN m.type_mouvement = 'entree' THEN m.quantite * m.prix_unitaire 
             WHEN m.type_mouvement = 'sortie' THEN -m.quantite * m.prix_unitaire 
             ELSE 0 END) AS total_balance
FROM mouvement m
WHERE TO_CHAR(m.date_mouvement, 'YYYY-MM') = (
    SELECT TO_CHAR(MAX(date_mouvement), 'YYYY-MM')
    FROM mouvement
)
GROUP BY TO_CHAR(m.date_mouvement, 'YYYY-MM'); `;

    const result = await pool.query(query);
    
    // FORMATAGE CORRECT DES DONNÉES NUMÉRIQUES
    const balanceData = {
      mois: result.rows[0].mois,
      total_balance: parseFloat(result.rows[0].total_balance) || 0,
      total_income: parseFloat(result.rows[0].total_income) || 0,
      total_expenses: parseFloat(result.rows[0].total_expenses) || 0
    };
    
    console.log('Balance data sent:', balanceData);
    res.json(balanceData);
    
  } catch (error) {
    console.error('Error in /api/balance:', error);   
  }
});

// Route pour les transactions  trouve de base de donne
app.get('/api/transactions/recent', async (req, res) => {
  try {
   
    console.log(`Fetching recent transactions`);
    
    const query = `
   SELECT 
    m.id_mouvement,
    m.type_mouvement,
    m.quantite,
    m.prix_unitaire,
    m.date_mouvement,
    m.commentaire,
    p.nom AS nom_produit,
    m.id_user
FROM mouvement m
LEFT JOIN produit p ON m.id_produit = p.id_produit
 ORDER BY m.date_mouvement DESC

;`

    
    const result = await pool.query(query);
    // FORMATAGE CORRECT DES DONNÉES
    const transactions = result.rows.map(row => ({
      id_mouvement: parseInt(row.id_mouvement),
      type_mouvement: row.type_mouvement,
      quantite: parseInt(row.quantite),
      date_mouvement:row.date_mouvement,
      prix_unitaire: parseFloat(row.prix_unitaire),
      commentaire: row.commentaire || '',
      nom_produit: row.nom_produit || 'Produit inconnu',
      id_user: parseInt(row.id_user)
    }));
    
    console.log(`Returning ${transactions.length} transactions`);
    res.json(transactions);
    
  } catch (error) {
    console.error('Error in /api/transactions/recent:', error);
  }
});

app.get('/api/transactions/recent', async (req, res) => {
  try {
   
    console.log(`Fetching recent transactions`);
    
    const query = `
   SELECT 
        id_produit,
        nom,
        categorie,
        prix_unitaire,
        stock_actuel
      FROM produit

;`
    const result = await pool.query(query);
    // FORMATAGE CORRECT DES DONNÉES
    const transactions = result.rows.map(row => ({
      id_mouvement: parseInt(row.id_mouvement),
      type_mouvement: row.type_mouvement,
      quantite: parseInt(row.quantite),
      date_mouvement:row.date_mouvement,
      prix_unitaire: parseFloat(row.prix_unitaire),
      commentaire: row.commentaire || '',
      nom_produit: row.nom_produit || 'Produit inconnu',
      id_user: parseInt(row.id_user)
    }));
    
    console.log(`Returning ${transactions.length} transactions`);
    res.json(transactions);
    
  } catch (error) {
    console.error('Error in /api/produitlist:', error);
      
  }
});

// Route pour la recherche de produits
app.get('/api/products/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    console.log(`Searching products for: "${searchTerm}"`);
    
    if (!searchTerm) {
      return res.json([]);
    }
    
    const query = `
      SELECT 
        id_produit,
        nom,
        categorie,
        prix_unitaire,
        stock_actuel
      FROM produit
      WHERE nom ILIKE $1 OR categorie ILIKE $1 or code_barre ILIKE $1
     
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`]);
    
    // FORMATAGE CORRECT DES DONNÉES
    const products = result.rows.map(row => ({
      id_produit: parseInt(row.id_produit),
      nom: row.nom,
      categorie: row.categorie,
      prix_unitaire: parseFloat(row.prix_unitaire),
      stock_actuel: parseInt(row.stock_actuel)
    }));
    
    console.log(`Found ${products.length} products`);
    res.json(products);
    
  } catch (error) {
    console.error('Error in /api/products/search:', error);
    res.json([]);
  }
});
// Route pour la recherche d'utilisateur

app.get('/api/utilisateur/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    if (!searchTerm) return res.json([]);

    const query = `
      SELECT nom, email, role, date_creation
      FROM users
      WHERE nom ILIKE $1 OR email ILIKE $1 OR role ILIKE $1
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`]);
    const user = result.rows.map(row => ({
      nom: row.nom,
      email: row.email,
      role: row.role,
      date_creation: row.date_creation
    }));

    res.json(user);
  } catch (error) {
    console.error('Error in /api/utilisateur/search:', error);
    res.json([]);
  }
});
// Route pour la recherche de fournisseur

app.get('/api/supplier/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    if (!searchTerm) return res.json([]);

    const query = `
      SELECT nom, adresse, contact
      FROM fournisseur
      WHERE nom ILIKE $1 OR adresse ILIKE $1 OR contact ILIKE $1
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`]);
    const user = result.rows.map(row => ({
      nom: row.nom,
      adresse: row.adresse,
      contact: row.contact,
    }));

    res.json(user);
  } catch (error) {
    console.error('Error in /api/utilisateur/search:', error);
    res.json([]);
  }
});

// 🟢 Récupérer la liste des utilisateurs
app.get('/api/getusers', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_user, nom, email, role FROM users ORDER BY id_user ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// 🟢 Récupérer la liste des produits
app.get('/api/getproduits', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_produit, nom, categorie, prix_unitaire, stock_actuel
      FROM produit
      ORDER BY id_produit ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors du chargement des produits :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// 🟢 Récupérer la liste des fournisseurs
app.get('/api/fournisseurs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_fournisseur, nom, contact, adresse
      FROM fournisseur
      ORDER BY id_fournisseur ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors du chargement des fournisseurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
//sauvgarder plusieur produit en meme temps 
app.post('/api/produitsT', async (req, res) => {
  try {
    const produits = req.body.produits;

    if (!Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun produit fourni' });
    }

    const results = [];

    for (let prod of produits) {
      const { nom, code_barre, categorie, prix_unitaire, stock_actuel, id_user, type_mouvement } = prod;

      if (!nom || !prix_unitaire || !stock_actuel || !id_user || !type_mouvement) {
        results.push({ success: false, message: `Champs manquants pour le produit ${nom || ''}` });
        continue;
      }

      // 🔍 Vérifier si le produit existe
      let existingProduit = null;
      if (code_barre) {
        const check = await pool.query('SELECT * FROM produit WHERE code_barre = $1', [code_barre]);
        existingProduit = check.rows[0];
      } 

      // 🟢 Cas 1 : Type "Achat" → créer ou mettre à jour le stock
      if (type_mouvement === 'entree') {
        let produitFinal;
        if (!existingProduit) {
          // Création d’un nouveau produit
          const insertProduit = await pool.query(
            'INSERT INTO produit (nom, code_barre, categorie, prix_unitaire, stock_actuel) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [nom, code_barre || '', categorie || '', prix_unitaire, stock_actuel]
          );
          produitFinal = insertProduit.rows[0];
        } else {
          // Mise à jour du stock existant (entrée)
          const newStock = existingProduit.stock_actuel + stock_actuel;
          await pool.query('UPDATE produit SET stock_actuel = $1 WHERE id_produit = $2', [newStock, existingProduit.id_produit]);
          produitFinal = { ...existingProduit, stock_actuel: newStock };
        }

        // Enregistrer le mouvement
        const mouvement = await pool.query(
          'INSERT INTO mouvement (type_mouvement, quantite, prix_unitaire, date_mouvement, id_produit, id_user) VALUES ($1,$2,$3,NOW(),$4,$5) RETURNING *',
          ['entree', stock_actuel, prix_unitaire, produitFinal.id_produit, id_user]
        );

        results.push({ success: true, produit: produitFinal, mouvement: mouvement.rows[0] });
      }

      // 🔴 Cas 2 : Type "Vente" → ne pas créer de produit, seulement mise à jour
      else if (type_mouvement === 'sortie') {
        if (!existingProduit) {
          results.push({
            success: false,
            message: `Produit "${nom}" introuvable. Impossible d'effectuer la vente.`,
          });
          continue;
        }

        // Vérifier stock suffisant
        if (existingProduit.stock_actuel < stock_actuel) {
          results.push({
            success: false,
            message: `Stock insuffisant pour "${nom}". Stock actuel: ${existingProduit.stock_actuel}, demandé: ${stock_actuel}`,
          });
          continue;
        }
       else if(existingProduit.stock_actuel> stock_actuel){
        const newStock = existingProduit.stock_actuel - stock_actuel;
        await pool.query('UPDATE produit SET stock_actuel = $1 WHERE id_produit = $2', [newStock, existingProduit.id_produit]);

        const mouvement = await pool.query(
          'INSERT INTO mouvement (type_mouvement, quantite, prix_unitaire, date_mouvement, id_produit, id_user) VALUES ($1,$2,$3,NOW(),$4,$5) RETURNING *',
          ['sortie', stock_actuel, prix_unitaire, existingProduit.id_produit, id_user]
        );
      
        results.push({
          success: true,
          produit: { ...existingProduit, stock_actuel: newStock },
          mouvement: mouvement.rows[0],
        });}
      }

      // 🚫 Autre type non reconnu
      else {
        results.push({ success: false, message: `Type de mouvement invalide: ${type_mouvement}` });
      }
    }

    return res.json(results);

  } catch (error) {
    console.error('Erreur POST /api/produitsT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
//modifier user
app.put('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
 const { nom, email, role } = req.body;
    if (!nom || !email || !role) {
      return res.status(400).json({ success: false, message: 'nom, email et role  sont obligatoires' });
    }

    const query = `
      UPDATE users
      SET nom = $1,
          email = $2,
          role = $3
          
      WHERE id_user = $4
      RETURNING *;
    `;

    const values = [nom, email, role,id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'users non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur PUT /api/user/:id:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
//modifier supplier
app.put('/api/fournisseurs/:id', async (req, res) => {
  try {
    const id = req.params.id;
 const { nomf, contact, adresse } = req.body;
    if (!nomf || !contact || !adresse) {
      return res.status(400).json({ success: false, message: 'nom, contact,adresse  sont obligatoires' });
    }

    const query = `
      UPDATE fournisseur
      SET nom = $1,
          contact = $2,
          adresse = $3
          
      WHERE id_fournisseur = $4
      RETURNING *;
    `;

    const values = [nomf, contact, adresse,id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'fournisseur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur PUT /api/fournisseurs/:id:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
// Modifier un produit
app.put('/api/produits/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nom, prix_unitaire, stock_actuel, categorie, code_barre } = req.body;

    if (!nom || !prix_unitaire || !stock_actuel) {
      return res.status(400).json({ success: false, message: 'Nom, prix et stock sont obligatoires' });
    }

    const query = `
      UPDATE produit
      SET nom = $1,
          prix_unitaire = $2,
          stock_actuel = $3,
          categorie = COALESCE($4, categorie),
          code_barre = COALESCE($5, code_barre)
      WHERE id_produit = $6
      RETURNING *;
    `;

    const values = [nom, prix_unitaire, stock_actuel, categorie, code_barre, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur PUT /api/produits/:id:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
// delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id_user = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, message: 'Utilisateur supprimé avec succès', user: result.rows[0] });
  } catch (error) {
    console.error('Erreur DELETE /api/users/:id:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

//delete fournisseur
app.delete('/api/fournisseurs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID fournisseur invalide' });
    }

    const result = await pool.query(
      'DELETE FROM fournisseur WHERE id_fournisseur = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
    }

    res.json({ success: true, message: 'Fournisseur supprimé avec succès', fournisseur: result.rows[0] });
  } catch (error) {
    console.error('Erreur DELETE /api/fournisseurs/:id:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
// Supprimer un produit
app.delete('/api/produits/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Supprimer le produit
    const result = await pool.query('DELETE FROM produit WHERE id_produit = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    res.json({ success: true, message: 'Produit supprimé avec succès', produit: result.rows[0] });
  } catch (error) {
    console.error('Erreur DELETE /api/produits/:id:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});
// Route de connexion
app.post("/login", async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    console.log('Login attempt for:', email);
    
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];

    // Vérifie le mot de passe
    if (user.mot_de_passe === mot_de_passe) {
      // Ne pas envoyer le mot de passe dans la réponse
      const { mot_de_passe, ...userWithoutPassword } = user;
      return res.json({ 
        success: true, 
        message: "Connexion réussie", 
        user: userWithoutPassword 
      });
    } else {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur",
      error: err.message 
    });
  }
});
app.post('/api/fournisseurinsert', async (req, res) => {
  try {
    const {nomf, contact ,adresse} = req.body;

    // 🔍 1️⃣ Vérification des données obligatoires
    if (!nomf || !contact || !adresse ) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires ',
      });
    }

    // 🔑 3️⃣ Vérifier si contact existe déjà
    const checkEmailQuery = `SELECT * FROM fournisseur WHERE contact = $1`;
    const existingUser = await pool.query(checkEmailQuery, [contact]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet fournisseur existe deja',
      });
    }
 // 🧠 4️⃣ Insertion du fournisseur
    const insertQuery = `
      INSERT INTO fournisseur (nom, contact, adresse,  date_creation)
      VALUES ($1, $2, $3,NOW())
      RETURNING *;
    `;
    const values = [nomf.trim(), contact.trim(), adresse.trim()];
    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];

    // ✅ 5️⃣ Réponse réussie
    return res.json({
      success: true,
      message: 'Fournisseur ajouté avec succès',
      user: newUser,
    });

  } catch (error) {
    console.error('Erreur lors de l’ajout de le fournisseur :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur interne',
      error: error.message,
    });
  }
});


// Route racine
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend Node.js connecté ✅",
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/test',
      '/api/balance',
      '/api/transactions/recent',
      '/api/products/search',
      '/api/user/current',
      '/login'
    ]
  });
});
// Route pour les routes API non trouvées - CORRECTION
app.all('/api/', (req, res) => {
  res.status(404).json({ 
    error: 'API route not found',
    path: req.originalUrl,
    availableRoutes: [
      '/api/test',
      '/api/balance',
      '/api/transactions/recent',
      '/api/products/search',
      '/api/user/current'
    ]
  });
});

// Route pour toutes les autres routes non trouvées - CORRECTION
app.all('', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    message: 'Utilisez les routes /api/* pour accéder à l\'API'
  });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message
  });
});

// ==================== DÉMARRAGE DU SERVEUR ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📱 Accessible sur le réseau: http://192.168.1.213:${PORT}`);
  console.log(`🔧 Testez: http://localhost:${PORT}/api/test`);
  console.log('📋 Routes disponibles:');
  console.log('   GET  /api/test');
  console.log('   GET  /api/balance');
  console.log('   GET  /api/transactions/recent');
  console.log('   GET  /api/products/search');
  console.log('   GET  /api/user/current');
  console.log('   POST /login');
});

// Gestion gracieuse de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await pool.end();
  process.exit(0);
});