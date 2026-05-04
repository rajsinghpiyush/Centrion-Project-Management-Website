import Project from "../model/projectModel.js";
import Workspace from "../model/workspaceModel.js";
import User from "../model/userModel.js";
import Notification from "../model/notificationModel.js";
import { checkProjectPermission } from "../utils/permissionUtils.js";

const emitProjectUpdate = async (io, projectId) => {
  if (!io) return;
  const freshProject = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (freshProject) {
    io.to(`project:${projectId}`).emit("project:updated", freshProject);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { workspace } = req.query;
    const query = {
      $or: [
        { owner: req.user._id },
        { members: { $elemMatch: { user: req.user._id, status: "active" } } },
      ],
    };
    if (workspace) query.workspace = workspace;

    const projects = await Project.find(query)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("workspace", "name");

    if (!project || !checkProjectPermission(project, req.user._id, "viewer")) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized or not found" });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, workspace, color, columns } = req.body;
    const workspaceDoc = await Workspace.findById(workspace);
    if (!workspaceDoc)
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });

    const project = await Project.create({
      name,
      description,
      workspace,
      owner: req.user._id,
      color,
      columns: columns || [
        { name: "To Do", order: 0 },
        { name: "In Progress", order: 1 },
        { name: "Review", order: 2 },
        { name: "Completed", order: 3 },
      ],
    });

    await project.populate("owner", "name email avatar");
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    await emitProjectUpdate(req.io, updatedProject._id);

    res.status(200).json({ success: true, project: updatedProject });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    await Project.findByIdAndDelete(req.params.id);
    if (req.io) {
      req.io
        .to(`project:${req.params.id}`)
        .emit("project:deleted", { projectId: req.params.id });
    }
    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { email, role = "editor" } = req.body;
    const allowedRoles = ["editor", "viewer"];

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Member email is required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only project owner can invite members",
        });
    }

    const invitee = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitee)
      return res
        .status(404)
        .json({ success: false, message: "User not found with this email" });

    if (invitee._id.toString() === project.owner.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Owner is already part of this project",
        });
    }

    const existingMember = project.members.find(
      (m) => m.user && m.user.toString() === invitee._id.toString(),
    );

    if (existingMember?.status === "active") {
      return res
        .status(400)
        .json({ success: false, message: "User is already a project member" });
    }

    if (existingMember?.status === "pending") {
      existingMember.role = role;
    } else if (existingMember?.status === "declined") {
      existingMember.role = role;
      existingMember.status = "pending";
      existingMember.addedAt = new Date();
    } else {
      project.members.push({ user: invitee._id, role, status: "pending" });
    }

    await project.save();

    const notification = await Notification.create({
      recipient: invitee._id,
      sender: req.user._id,
      type: "project-invited",
      title: "Project Invitation",
      message: `${req.user.name} invited you to join ${project.name}`,
      relatedProject: project._id,
      link: `/projects/${project._id}`,
    });

    await emitProjectUpdate(req.io, project._id);

    if (req.io) {
      req.io.to(`user:${invitee._id}`).emit("notification:new", notification);
    }

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res
      .status(200)
      .json({
        success: true,
        message: "Invitation sent",
        project: updatedProject,
      });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only project owner can remove members",
        });
    }

    const originalCount = project.members.length;
    project.members = project.members.filter(
      (m) => m.user.toString() !== userId.toString(),
    );

    if (project.members.length === originalCount) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found in project" });
    }

    await project.save();
    await emitProjectUpdate(req.io, project._id);

    if (req.io) {
      req.io
        .to(`user:${userId}`)
        .emit("project:membership-removed", {
          projectId: project._id.toString(),
        });
    }

    res.status(200).json({ success: true, message: "Member removed" });
  } catch (error) {
    next(error);
  }
};

export const respondToProjectInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "declined"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid invitation response" });
    }

    const project = await Project.findById(id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const member = project.members.find(
      (m) =>
        m.user.toString() === req.user._id.toString() && m.status === "pending",
    );

    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Pending invitation not found" });
    }

    member.status = status;
    await project.save();

    await Notification.updateMany(
      {
        recipient: req.user._id,
        relatedProject: project._id,
        type: "project-invited",
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );

    await emitProjectUpdate(req.io, project._id);

    if (req.io) {
      req.io.to(`user:${project.owner}`).emit("project:invitation-responded", {
        projectId: project._id.toString(),
        userId: req.user._id.toString(),
        status,
      });
    }

    res.status(200).json({ success: true, message: `Invitation ${status}` });
  } catch (error) {
    next(error);
  }
};

export const transferProjectOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res
        .status(400)
        .json({ success: false, message: "New owner is required" });
    }

    const project = await Project.findById(id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only owner can transfer ownership" });
    }

    const newOwnerMember = project.members.find(
      (m) =>
        m.user.toString() === newOwnerId.toString() && m.status === "active",
    );

    if (!newOwnerMember) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New owner must be an active member",
        });
    }

    const previousOwnerId = project.owner.toString();
    project.owner = newOwnerId;

    project.members = project.members.filter(
      (m) => m.user.toString() !== newOwnerId.toString(),
    );

    const previousOwnerMember = project.members.find(
      (m) => m.user.toString() === previousOwnerId,
    );
    if (previousOwnerMember) {
      previousOwnerMember.role = "editor";
      previousOwnerMember.status = "active";
    } else {
      project.members.push({
        user: previousOwnerId,
        role: "editor",
        status: "active",
      });
    }

    await project.save();
    await emitProjectUpdate(req.io, project._id);

    if (req.io) {
      req.io.to(`user:${newOwnerId}`).emit("project:ownership-transferred", {
        projectId: project._id.toString(),
      });
    }

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res
      .status(200)
      .json({
        success: true,
        message: "Ownership transferred",
        project: updatedProject,
      });
  } catch (error) {
    next(error);
  }
};
