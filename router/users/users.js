const router = require("../auth");

router.get("/login", (req, res) => {
  res.send("<h1>Hello from sign in!!!</h1>");
});

router.get("/signup", (req, res) => {
  res.send("<h1>Hello from sign up!!!</h1>");
});

module.exports = router;
