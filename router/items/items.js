const router = require("../auth");

router.get("/aboutus", (req, res) => {
  res.send("<h1>Hello from about!!!</h1>");
});

router.get("/contact", (req, res) => {
  res.send("<h1>Hello contact!!!</h1>");
});



module.exports = router;