const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();
// router.get("/register", async (req, res) => {
//   console.log("hello");
//   res.json({ message: "vgdshv" });
// });
router.post("/register", register);
// router.post("/login", login);

module.exports = router;
