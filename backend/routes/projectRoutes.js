import express from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  respondToProjectInvitation,
  transferProjectOwnership,
} from "../controller/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getProjects).post(protect, createProject);

router
  .route("/:id")
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post("/:id/members", protect, addProjectMember);
router.delete("/:id/members/:userId", protect, removeProjectMember);
router.post("/:id/invitation", protect, respondToProjectInvitation);
router.put("/:id/transfer-ownership", protect, transferProjectOwnership);

export default router;
