import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import subjectsRouter from "./subjects";
import uploadsRouter from "./uploads";
import knowledgeRouter from "./knowledge";
import flashcardsRouter from "./flashcards";
import chatRouter from "./chat";
import teamsRouter from "./teams";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(subjectsRouter);
router.use(uploadsRouter);
router.use(knowledgeRouter);
router.use(flashcardsRouter);
router.use(chatRouter);
router.use(teamsRouter);
router.use(notificationsRouter);

export default router;
