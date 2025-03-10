const express = require("express");
const router = express.Router();
const { getBarang, deleteBarang } = require('../controllers/barangControllers');

console.log(require('../controllers/barangControllers'));

router.get('/barang', getBarang);
router.delete("/barang/:id", deleteBarang);


module.exports = router;
