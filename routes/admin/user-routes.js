const express = require("express");
const {
  deleteUser,
  fetchAllUsers,
} = require("../../controllers/admin/user-controller");

const router = express.Router();

router.delete("/delete/:id", deleteUser);
router.get("/get", fetchAllUsers);

module.exports = router;
