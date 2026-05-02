import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import healthRouter from "./health";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import tagsRouter from "./tags";
import speciesRouter from "./species";
import portfolioRouter from "./portfolio";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";
import feedRouter from "./feed";
import analyticsRouter from "./analytics";
import sitemapRouter from "./sitemap";

const router: IRouter = Router();

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(generalLimiter);
router.use("/contact", strictLimiter);
router.use("/newsletter", strictLimiter);

router.use(healthRouter);
router.use(articlesRouter);
router.use(categoriesRouter);
router.use(tagsRouter);
router.use(speciesRouter);
router.use(portfolioRouter);
router.use(contactRouter);
router.use(newsletterRouter);
router.use(feedRouter);
router.use(analyticsRouter);
router.use(sitemapRouter);

export default router;
