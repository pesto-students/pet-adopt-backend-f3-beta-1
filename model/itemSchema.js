const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  uudi: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  images: {
    type: Number,
    required: true,
  },
  property: {
    type: String,
    required: true,
  },
  requests: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("ITEM", itemSchema);

module.exports = Item;
