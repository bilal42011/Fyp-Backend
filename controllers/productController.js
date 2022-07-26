const Product = require("../models/Product");
const User = require("../models/User");

class ProductController {
  async getProducts(req, res) {
    try {
      const { page, category, search } = req.query;
      const limit = 10;
      if (!search) {
        const products = await Product.find({ category })
          .skip((page - 1) * limit)
          .limit(10)
          .populate("ownerId");
        const result = {
          count: products.length,
          products,
          totalPages: Math.ceil(products.length / limit),
        };
        return res.status(200).json({
          status: "success",
          result,
        });
      } else {
        const products = await Product.find({
          category,
          $or: [
            { title: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
          ],
        })
          .skip((page - 1) * limit)
          .limit(10)
          .populate("ownerId");
        const result = {
          count: products.length,
          products,
          totalPages: Math.ceil(products.length / limit),
        };
        return res.status(200).json({
          status: "success",
          result,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        status: "error",
        message: err.message,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const { title, description, category, hasSizes, price, quantity } =
        req.body;
      const product = {
        title,
        description,
        category,
        hasSizes,
        price,
        quantity,
      };
      product.ownerId = req.userInfo.id;
      product.images = req.files.map((elem) => {
        return { filename: elem.filename, path: elem.path };
      });
      const newProduct = await Product.create(product);
      const user = await User.findByIdAndUpdate(req.userInfo.id, {
        $push: { products: newProduct._id },
      });
      return res.status(201).json({
        status: "success",
        product: newProduct,
      });
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        status: "error",
        message: err.message,
      });
    }
  }

  async getProduct(req, res) {
    const { productId } = req.params;
    try {
      const product = await Product.findById(productId).populate("ownerId");

      return res.status(200).json({
        status: "success",
        product,
      });
    } catch (err) {
      return res.status(404).json({
        status: "Error",
        info: "Product not found",
        message: err.message,
      });
    }
  }

  async updateProduct(req, res) {
    const { productId } = req.params;
    const { title, description, category, hasSizes, price, quantity } =
      req.body;

    try {
      const product = await Product.findByIdAndUpdate(productId, {
        title,
        description,
        category,
        hasSizes,
        price,
        quantity,
      });

      return res.status(204).json({
        status: "success",
        product,
      });
    } catch (err) {
      return res.status(404).json({
        status: "Error",
        info: "Product not found",
        message: err.message,
      });
    }
  }

  async deleteProduct(req, res) {
    const { productId } = req.params;
    try {
      const product = await Product.findById(productId);

      const user = await User.findByIdAndUpdate(product.ownerId, {
        $pull: { products: product._id },
      });

      await product.delete();

      return res.status(200).json({
        status: "success",
        product,
      });
    } catch (err) {
      return res.status(404).json({
        status: "Error",
        info: "Product not found",
        message: err.message,
      });
    }
  }
}

module.exports = new ProductController();
