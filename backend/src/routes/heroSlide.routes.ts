import { Router } from "express";

import {
  getPublicHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "../controllers/heroSlide.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadHeroImage } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getPublicHeroSlides);
router.get("/all", authenticate, authorize("admin"), getAllHeroSlides);
router.post("/", authenticate, authorize("admin"), uploadHeroImage, createHeroSlide);
router.patch("/:id", authenticate, authorize("admin"), uploadHeroImage, updateHeroSlide);
router.delete("/:id", authenticate, authorize("admin"), deleteHeroSlide);

export default router;