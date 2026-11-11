const express = require("express");
const mongoose = require("mongoose");

module.exports = function resourceRouter(Model, label, resourceKey, memoryStore) {
  const router = express.Router();

  const isMongo = () => mongoose.connection.readyState === 1;

  router.get("/", async (req, res, next) => {
    try {
      if (isMongo()) {
        return res.json(await Model.find().sort({ createdAt: -1 }).limit(500));
      }
      return res.json(memoryStore[resourceKey] || []);
    } catch (e) {
      if (memoryStore && memoryStore[resourceKey]) {
        return res.json(memoryStore[resourceKey]);
      }
      next(e);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      if (isMongo()) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
        const item = await Model.findById(req.params.id);
        if (!item) return res.status(404).json({ message: `${label} not found.` });
        return res.json(item);
      }
      const list = memoryStore[resourceKey] || [];
      const item = list.find((x) => String(x._id) === String(req.params.id));
      if (!item) return res.status(404).json({ message: `${label} not found.` });
      return res.json(item);
    } catch (e) { next(e); }
  });

  router.post("/", async (req, res, next) => {
    try {
      if (isMongo()) {
        return res.status(201).json(await Model.create(req.body));
      }
      const newItem = {
        _id: "id_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      if (!memoryStore[resourceKey]) memoryStore[resourceKey] = [];
      memoryStore[resourceKey].unshift(newItem);
      return res.status(201).json(newItem);
    } catch (e) { next(e); }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      if (isMongo()) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: `${label} not found.` });
        return res.json(item);
      }
      const list = memoryStore[resourceKey] || [];
      const index = list.findIndex((x) => String(x._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ message: `${label} not found.` });
      list[index] = { ...list[index], ...req.body };
      return res.json(list[index]);
    } catch (e) { next(e); }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      if (isMongo()) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid record ID." });
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: `${label} not found.` });
        return res.json({ message: `${label} deleted successfully.` });
      }
      const list = memoryStore[resourceKey] || [];
      const index = list.findIndex((x) => String(x._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ message: `${label} not found.` });
      list.splice(index, 1);
      return res.json({ message: `${label} deleted successfully.` });
    } catch (e) { next(e); }
  });

  return router;
};
