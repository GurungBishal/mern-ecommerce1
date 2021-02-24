const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

const categoryCtrl = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      //for admin, role = 1 and for other role = 0
      //only admin can crud the category

      const { name } = req.body;
      const category = await Category.findOne({ name });
      if (category) res.status(400).json({ msg: "Category already exists" });

      const newCategory = new Category({ name });
      await newCategory.save();
      res.status(200).json({ msg: "Category created" });
      res.json("check the admin message");
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const products = await Products.findOne({ category: req.params.id });
      if (products)
        return res
          .status(400)
          .json({ msg: "Please delete all the products with a relationship" });
      await Category.findByIdAndDelete(req.params.id);
      res.json({ msg: "Category deleted" });
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.findOneAndUpdate({ _id: req.params.id }, { name });
      res.json({ msg: "Category updated" });
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  },
};

module.exports = categoryCtrl;
